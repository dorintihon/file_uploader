import assert from 'node:assert/strict';
import { beforeEach, mock, test } from 'node:test';

const queries = Object.fromEntries(
  ['getFolderById', 'createFileInDB', 'getFileById', 'deleteFileById']
    .map((name) => [name, mock.fn()]),
);
const uploadStream = mock.fn();
const end = mock.fn();
let uploadError;

mock.module('../db/queries.js', { namedExports: queries });
mock.module('../config/cloudinary.js', {
  defaultExport: { uploader: { upload_stream: uploadStream } },
});
mock.module('multer', {
  defaultExport: Object.assign(() => ({
    single: (field) => {
      assert.equal(field, 'uploaded_file');
      return (req, res, callback) => callback(uploadError);
    },
  }), { memoryStorage: () => ({}) }),
});

const controller = await import('../controllers/fileController.js');
const limit = 10 * 1024 * 1024;

function request(file = undefined) {
  return {
    params: { folderId: '12', fileId: '34' },
    user: { id: 7 },
    file,
  };
}

function response() {
  let finish;
  const completed = new Promise((resolve) => { finish = resolve; });
  const res = {
    statusCode: 200,
    completed,
    status: mock.fn((code) => { res.statusCode = code; return res; }),
    send: mock.fn((body) => { res.body = body; finish(); return res; }),
    render: mock.fn((view, data) => { res.view = view; res.data = data; finish(); }),
    redirect: mock.fn((url) => { res.location = url; finish(); }),
  };
  return res;
}

function file(size = 5) {
  return { originalname: 'hello.txt', mimetype: 'text/plain', size, buffer: Buffer.from('hello') };
}

beforeEach(() => {
  for (const fn of [...Object.values(queries), uploadStream, end]) {
    fn.mock.resetCalls();
    fn.mock.mockImplementation(() => undefined);
  }
  uploadError = undefined;
  queries.getFolderById.mock.mockImplementation(async () => ({ id: 12 }));
  uploadStream.mock.mockImplementation((options, callback) => {
    // Cloudinary completes asynchronously after the buffer is written.
    queueMicrotask(() => callback(null, {
      secure_url: 'https://example.com/hello.txt', public_id: 'folders/12/hello',
    }));
    return { end };
  });
});

test('upload form looks up the folder for the signed-in user', async () => {
  const res = response();
  await controller.addFileForm(request(), res);
  assert.deepEqual(queries.getFolderById.mock.calls[0].arguments, [12, 7]);
  assert.equal(res.view, 'forms/addFile');
  assert.deepEqual(res.data, { folder: { id: 12 } });
});

test('upload form returns 404 for an unavailable folder', async () => {
  queries.getFolderById.mock.mockImplementation(async () => null);
  const res = response();
  await controller.addFileForm(request(), res);
  assert.equal(res.statusCode, 404);
  assert.equal(res.body, 'Folder not found');
});

test('upload saves Cloudinary metadata and redirects to the folder', async () => {
  const uploaded = file();
  const res = response();
  await controller.postUpload(request(uploaded), res);
  await res.completed;
  assert.deepEqual(queries.getFolderById.mock.calls[0].arguments, [12, 7]);
  assert.deepEqual(uploadStream.mock.calls[0].arguments[0], {
    resource_type: 'auto', folder: 'folders/12',
  });
  assert.equal(end.mock.calls[0].arguments[0], uploaded.buffer);
  assert.deepEqual(queries.createFileInDB.mock.calls[0].arguments, [{
    name: 'hello.txt', type: 'text/plain', size: 5, folderId: 12, userId: 7,
    url: 'https://example.com/hello.txt', publicId: 'folders/12/hello',
  }]);
  assert.equal(res.location, '/folders/12');
});

test('upload rejects an unavailable folder without uploading or saving', async () => {
  queries.getFolderById.mock.mockImplementation(async () => null);
  const res = response();
  await controller.postUpload(request(file()), res);
  assert.equal(res.statusCode, 404);
  assert.equal(uploadStream.mock.callCount(), 0);
  assert.equal(queries.createFileInDB.mock.callCount(), 0);
});

test('upload rejects a missing file', async () => {
  const res = response();
  await controller.postUpload(request(), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body, 'No file uploaded');
  assert.equal(uploadStream.mock.callCount(), 0);
});

test('upload rejects files larger than 10 MB before contacting Cloudinary', async () => {
  const res = response();
  await controller.postUpload(request(file(limit + 1)), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body, 'File size exceeds 10MB limit');
  assert.equal(uploadStream.mock.callCount(), 0);
  assert.equal(queries.createFileInDB.mock.callCount(), 0);
});

test('upload accepts a file exactly at the 10 MB limit', async () => {
  const res = response();
  await controller.postUpload(request(file(limit)), res);
  await res.completed;
  assert.equal(res.location, '/folders/12');
  assert.equal(queries.createFileInDB.mock.calls[0].arguments[0].size, limit);
});

for (const failure of ['middleware', 'cloudinary callback', 'cloudinary stream', 'database']) {
  test(`upload returns 500 on ${failure} failure`, async (t) => {
    t.mock.method(console, 'error', () => {});
    const error = new Error('Upload failed');
    if (failure === 'middleware') uploadError = error;
    if (failure === 'cloudinary callback') {
      uploadStream.mock.mockImplementation((options, callback) => {
        queueMicrotask(() => callback(error));
        return { end };
      });
    }
    if (failure === 'cloudinary stream') {
      uploadStream.mock.mockImplementation(() => { throw error; });
    }
    if (failure === 'database') {
      queries.createFileInDB.mock.mockImplementation(async () => { throw error; });
    }
    const res = response();
    await controller.postUpload(request(file()), res);
    await res.completed;
    assert.equal(res.statusCode, 500);
    assert.equal(res.body, 'Internal Server Error');
    assert.equal(res.redirect.mock.callCount(), 0);
    if (failure !== 'database') assert.equal(queries.createFileInDB.mock.callCount(), 0);
  });
}

test('file details are scoped to the user and folder', async () => {
  const record = { id: 34, name: 'hello.txt' };
  queries.getFileById.mock.mockImplementation(async () => record);
  const res = response();
  await controller.getFile(request(), res);
  assert.deepEqual(queries.getFileById.mock.calls[0].arguments, [34, 7, 12]);
  assert.equal(res.view, 'forms/file');
  assert.deepEqual(res.data, { file: record, folderId: 12 });
});

for (const handler of ['getFile', 'downloadFile']) {
  test(`${handler} returns 404 for a missing or inaccessible file`, async () => {
    queries.getFileById.mock.mockImplementation(async () => null);
    const res = response();
    await controller[handler](request(), res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body, 'File not found');
    assert.equal(res.redirect.mock.callCount(), 0);
  });
}

test('file details return 500 when the database fails', async (t) => {
  t.mock.method(console, 'error', () => {});
  queries.getFileById.mock.mockImplementation(async () => { throw new Error('DB unavailable'); });
  const res = response();
  await controller.getFile(request(), res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body, 'Internal Server Error');
});

test('download redirects to the stored URL after a scoped lookup', async () => {
  queries.getFileById.mock.mockImplementation(async () => ({ url: 'https://example.com/file' }));
  const res = response();
  await controller.downloadFile(request(), res);
  assert.deepEqual(queries.getFileById.mock.calls[0].arguments, [34, 7, 12]);
  assert.equal(res.location, 'https://example.com/file');
});

test('delete scopes the request to the user and folder and redirects', async () => {
  const res = response();
  await controller.deleteFile(request(), res);
  assert.deepEqual(queries.deleteFileById.mock.calls[0].arguments, [34, 7, 12]);
  assert.equal(res.location, '/folders/12');
});

test('delete returns 500 when deletion fails', async (t) => {
  t.mock.method(console, 'error', () => {});
  queries.deleteFileById.mock.mockImplementation(async () => { throw new Error('Delete failed'); });
  const res = response();
  await controller.deleteFile(request(), res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body, 'Internal Server Error');
  assert.equal(res.redirect.mock.callCount(), 0);
});
