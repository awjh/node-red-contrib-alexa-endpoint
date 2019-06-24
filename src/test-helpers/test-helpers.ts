export function noCacheRequire (path: string) {
    delete require.cache[require.resolve(path)];
    return require(path);
}
