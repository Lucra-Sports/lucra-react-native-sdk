# Lucra Expo Sample app

## Running

- Since this app is embedded in the main mono repo it npm breaks itself trying to symlink the node_modules, therefore you have to use yarn
- Update the `package.json` dependency to the latest published version of the `@lucra-sports/lucra-react-native-sdk` package
- Create a `.env` file (next to the `.env.example`) with the same contents and a valid key
- Follow the instructios on the main readme to create a github classic token and create the .npmrc
- `yarn`
- `npx expo prebuild --clean`
