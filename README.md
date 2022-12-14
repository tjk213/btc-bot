# BTC-Bot: Rolling Bitcoin ROI
[//]: # "This file uses null hyperlink labels for comments. See https://stackoverflow.com/questions/4823468/comments-in-markdown"

[//]: # "Add clasp badge at top of readme (copied from clasp readme)"
[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

`btc-bot` is a GoogleScripts system for auto-updating google sheets with BTC historical data. The system produces charts that look something like this:

<img width="770" alt="Screen Shot 2022-08-31 at 2 28 32 PM" src="https://user-images.githubusercontent.com/4040020/187752784-18bbac43-4e1b-475a-aa55-de0d9c2764fe.png">

## Distribution

The charts are auto-updated on a monthly basis and the results are shared via email. If you would like to be added to the distribution list please send me a note at tjk213@gmail.com.

## Building & Deployment

`btc-bot` can be built with the following:

``` bash
% pip install -r requirements.txt  # Install python dependencies
% make                             # Build btc-bot
```

The build system's primary function is to inline all CSS into embedded HTML style tags in preparation for emailing. For more information on why this is necessary, see [HTML Compilation Notes](doc/HTMLCompilation.md).

Once built, `btc-bot` is ready for deployment to the GoogleScripts system, which is managed through [Clasp](https://github.com/google/clasp). 

## Contributing

Contributions are welcome. If you would like to contribute or make a request please feel free to open an issue, PR, or contact me via email.

## Troubleshooting

If you have issues with clasp connecting to google, it may be a known issue. A few quick things to try:

  - Enable Google Apps Script API (follow instructions [here](https://github.com/google/clasp#install))
  - Downgrade to clasp v2.3.1 (see [this issue](https://github.com/google/clasp/issues/872))
    - Run: `npm install -g @google/clasp@2.3.1`
