# Can't deploy into the directory because it will wipe the .git directory
# Using rsync to delete unneeded files
tools/deploy.sh -T && rsync -rpt --delete --exclude=.git deploy/moon-flickr/ deploy/gh-pages/
echo "cd into the deploy/gh-pages directory and commit changes to origin gh-pages"
