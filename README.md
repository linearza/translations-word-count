# translations-word-count

A simple Node app to process json and yaml files to get the accurate word count for translation purposes.
Excludes words containing `{ }` - variables.
Works with nested directory structure.
Supports a mix of json and yaml files.

To run:
```
npm start '../my/translations/dir'
```

Optionally you can pass file name patterns to exclude:
```
npm start '../my/translations/dir' 'pattern1-' 'patternTwo' 'etc...' 
```