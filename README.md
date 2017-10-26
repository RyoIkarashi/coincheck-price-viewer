# coincheck-price-viewer
A tiny coincheck price viewer for bitbar

## Installation

```bash
# move to a bitbar plugin directory
cd /path/to/bitbar-plugin-directory/
# download the source
git clone https://github.com/RyoIkarashi/coincheck-price-viewer.git
# move to the directory and install node moduels
( cd coincheck-price-viewer && yarn install )
# add a symlink to (make sure you're in a bitbar plugin directory)
ln -s ./coincheck-price-viewer/coincheck.5s.js
```

## Add your own `access_key` and `secret_key`

Edit `env.json` and replace `<YOUR_ACCESS_KEY>` and `<YOUR_ACCESS_SECRET_KEY>` with yours.

## Screenshot
![screenshot](https://user-images.githubusercontent.com/5750408/32035498-a5239428-ba54-11e7-8560-b1aff376230c.png)
