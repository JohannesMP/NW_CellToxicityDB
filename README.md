# 6mer Seed Toxicity

A tool to look up the toxicity of any siRNA, shRNA or miRNA with known 6mer seed sequence.


## About

This site was created in collaboration with the [Peter Lab](labs.feinberg.northwest) at the Feinberg School of Medicine of Northwestern University.

It allows to determine the activity of any siRNA, shRNA, or miRNA to be toxic through induction of DISE (death induced by survival gene elimination) in human (HeyA8 - ovarian, H460 - lung and H4 - brain) and mouse (M565 - liver, 3LL - lung and GL261 - brain) cancer cell lines.

The app is entirely static, hosted with [Github Pages](https://pages.github.com/) and all data filtering and download file generation occurs locally without any server requests made apart from the initial browser request.


## How to use

Please refer to the [sections at the bottom of the live website](https://6merdb.org#how-to-use).


## References

Gao, Q.Q., Putzbach, W.E., Murmann, A.E., Chen, S., Sarshad, A.A., Peter, J.M., Bartom, E.T., Hafner, M. and Peter, M.E. (2018) 6mer seed toxicity in tumor suppressive microRNAs. Nature Comm, in press. Preprint at BioRxiv: https://doi.org/10.1101/284406


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
