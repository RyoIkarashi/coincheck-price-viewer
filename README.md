# coincheck-price-viewer
A tiny coincheck price viewer for bitbar

## Installation

```bash
# move to a bitbar plugin directory
cd /path/to/bitbar-plugin-directory/
# download the source
git clone https://github.com/RyoIkarashi/coincheck-price-viewer.git
# move to the directory and install node moduels
( cd coincheck-price-viewer && npm install )
# add a symlink to (make sure you're in a bitbar plugin directory)
ln -s ./coincheck-price-viewer/coincheck.5s.js
```

## Add your own `access_key` and `secret_key`

Edit `env.json` and replace `<YOUR_ACCESS_KEY>` and `<YOUR_ACCESS_SECRET_KEY>` with yours.

## Screenshot
![Screenshot](https://raw.githubusercontent.com/RyoIkarashi/coincheck-price-viewer/screenshots/screenshots/Screen%20Shot%202017-10-26%20at%2013.17.58.png)
