# NW_CellToxicityDB

## About

This site was created in collaboration with the [Peter Lab](labs.feinberg.northwest) at the Feinberg School of Medicine of Northwestern University.

The app is entirely static, hosted with [Github Pages](https://pages.github.com/) and all data filtering and download file generation occurs locally without any server requests made apart from the initial browser request.


## How to use

This site allows to look up the activity of any siRNA, shRNA, or miRNA duplex to be toxic through induction of DISE (death induced by survival gene elimination) in a human and a mouse cell line.

Just type one of 4096 possible 6mers into the search field or any nucleotide sequence of less than 6 nucleotides. Use positions 2-7 of the guide/antisense strand of the siRNA duplex as the 6mer.



## References

Gao, Q.Q., Putzbach, W.E., Murmann, A.E., Chen, S., Sarshad, A.A., Ambrosini, G., Bartom, E.T., Hafner, M. and Peter, M.E. Induction of DISE by tumor suppressive microRNAs. Submitted.


## Libraries Used

- [JQuery 3.3.1](https://jquery.com/): Dom manipulation
- [D3 4.13.0](https://d3js.org/): CSV loading and data visualization 
- [Bootstrap 4.0.0](https://getbootstrap.com/): UI Framework
- [Bootstrap Toggle 2.2.2](http://www.bootstraptoggle.com/): easy smartphone-style toggles
- [DataTables 1.10.16](https://datatables.net/): table UI and data manipulation
- [FileSaverJS 1.3.5](https://github.com/eligrey/FileSaver.js/) and [BlobJS](https://github.com/eligrey/Blob.js): Fallback for local file saving
- [FontAwesome 5.0.8 (Free)](https://fontawesome.com/): Icons
- [Google Analytics](https://www.google.com/analytics)
