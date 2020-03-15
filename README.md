# Short Ext
![](promo/marquee.png)

Install from [Chrome Web Store](https://short-d.com/r/ext)

## Preview
![](doc/usage.gif)

## Prerequisites
- yarn v1.17.3
- node v12.3.1

## Getting Started
### Setup
```bash
cp .env.dist .env.development
```
Replace `APP_BASE_URL` with the URL of the web frontend.

### Build
#### For Local Development
```
yarn
yarn:development
```

#### For Production Release
Once the wanted changes are merged into master branch, [create a release tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) with the new [version](https://semver.org/).\
Eg. `0.0.7`

### Install
1. Navigate to `chrome://extensions/` in Google Chrome.
2. Turn on `developer mode`.
![](doc/screenshot/developer-mode.png)
3. Click on `Load unpacked`.
![](doc/screenshot/load-unpacked.png)
4. Select `build` directory.
5. **Short** should now up in extension list.
![](doc/screenshot/extension.png)

## Contributing
When contributing to this repository, please first discuss the change you wish to make via [issues](https://short-d.com/r/extissue) with the owner of this repository before making a change.

### Pull Request Process
1. Update the README.md with details of changes to the interface, this includes new environment 
   variables, exposed ports, useful file locations and container parameters.
2. You may merge the Pull Request in once you have the sign-off of code owner, or if you 
   do not have permission to do that, you may request the code owner to merge it for you.

## Author
Harry Liu - [byliuyang](https://github.com/byliuyang)

## License
This project is maintained under MIT license
