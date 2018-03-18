# 6mer Seed Toxicity

A tool to look up the toxicity of any siRNA, shRNA or miRNA with known 6mer seed sequence.


## About

This site was created in collaboration with the [Peter Lab](labs.feinberg.northwest) at the Feinberg School of Medicine of Northwestern University.

It allows to determine the activity of any siRNA, shRNA, or miRNA to be toxic through induction of DISE (death induced by survival gene elimination) in a human (HeyA8) and a mouse (M565) cell line.

The app is entirely static, hosted with [Github Pages](https://pages.github.com/) and all data filtering and download file generation occurs locally without any server requests made apart from the initial browser request.


## How to use

See the 'Info' section at the bottom of the page.


## References

Gao, Q.Q., Putzbach, W.E., Murmann, A.E., Chen, S., Ambrosini, G., Peter, J.M., Bartom, E.T. and Peter, M.E. Induction of DISE by Tumor Suppressive MicroRNAs. Submitted.


## Libraries Used

- [JQuery 3.3.1](https://jquery.com/): Dom manipulation
- [JQuery Highlight](https://github.com/bartaz/sandbox.js/blob/master/jquery.highlight.js): Dom highlighting
- [D3 4.13.0](https://d3js.org/): CSV loading and data visualization
- [Async 2.6.0](https://caolan.github.io/async/): Asynchronous javascript
- [Bootstrap 4.0.0](https://getbootstrap.com/): UI Framework
- [Bootstrap Toggle 2.2.2](http://www.bootstraptoggle.com/): easy smartphone-style toggles
- [DataTables 1.10.16](https://datatables.net/): table UI and data manipulation
- [FileSaverJS 1.3.5](https://github.com/eligrey/FileSaver.js/) and [BlobJS](https://github.com/eligrey/Blob.js): Fallback for local file saving
- [FontAwesome 5.0.8 (Free)](https://fontawesome.com/): Icons
- [Google Analytics](https://www.google.com/analytics)


## License

This project is available under the [MIT license](https://github.com/JohannesMP/NW_CellToxicityDB/blob/master/LICENSE).
