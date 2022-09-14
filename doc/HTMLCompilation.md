# HTML Compilation

### Toolchain

`btc-bot`'s HTML is processed by a lightweight compilation toolchain prior to deployment:

  - Inline CSS into embedded HTML style tags using [premailer](https://github.com/peterbe/premailer)
  - Convert designated inline comments into google scriptlet tags with [gscc.py](../tools/gscc.py)

### Requirements

Inline CSS is necessary because of the following:

  - Some email clients do not render out-of-line CSS correctly
    - Note: `premailer` even generates legacy tags where possible for extended compatibility
  - Many (all?) email clients strip out-of-line CSS on forwarding

We want emails from `btc-bot` to display nicely on as many devices & clients as possible, and certainly don't want to lose all formatting on forward. So, inline-CSS is strictly necessary.

### Design Notes

For inlining tools, `premailer` is far and away the best option I have been able to find. However, it does not handle Google's [scriptlet tags](https://developers.google.com/apps-script/guides/html/templates) correctly. To work around this, I've implemented a very simple & naive placeholder syntax using inline comments. If successful, these placeholders propagate through `premailer` without modification, and then `gscc.py` is invoked to convert them to proper scriptlet syntax. So far, this is working for all cases of interest but it has not been thoroughly tested. Note that working with non-trivial printing scriptlets can be a bit finnicky - e.g., nesting order of [single-vs-double quotes matters](https://github.com/tjk213/btc-bot/commit/fcb335a411f18839bf1f0442a1c9c65707aa8c6b).
