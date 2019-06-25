import * as pathUtil from 'path';

export function noCacheRequire (path: string) {
    const parentPath = pathUtil.dirname(module.parent.filename);

    path = pathUtil.resolve(parentPath, path);

    delete require.cache[require.resolve(path)];
    return require(path);
}
