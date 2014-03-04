tools/deploy.sh -T && cp -rf deploy/moon-flickr/* deploy/gh-pages/ && cp -rf enyo deploy/gh-pages/ && cp -rf lib deploy/gh-pages/ && rm -rf  && (cd deploy/gh-pages; git push origin gh-pages);
