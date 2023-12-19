#1 update vite.config.js

#export default defineConfig({
  #base:'{ project-name (without brackets) }', ex : '/shuini/'
  #plugins: [react()],
  #optimizeDeps: {
   # exclude: ['pocketbase']
  #}
#})

#2 run : npm run build

#3 git add dist -f

#4 git commit -m 'adding dist'

#5 git subtree push --prefix dist origin gh-pages
