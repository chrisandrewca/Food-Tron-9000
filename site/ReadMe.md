# ft9
kill -9 $(netstat -tulpen | grep 3000 | grep -Po '[0-9]*(?=\/node)')
kill -9 $(netstat -tulpen | grep 3001 | grep -Po '[0-9]*(?=\/node)')

## CLI Commands

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# test the production build locally
npm run serve

# run tests with jest and preact-render-spy 
npm run test
```

For detailed explanation on how things work, checkout the [CLI Readme](https://github.com/developit/preact-cli/blob/master/README.md).
