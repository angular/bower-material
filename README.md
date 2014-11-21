## bower-material

This repository contains the Bower release of [angular-material](https://github.com/angular/material).

### Installing Angular-Material

Change to your projects root directory.
To get the latest stable version, use Bower from the command line:

```sh
bower install angular-material
```

To get the most recent, last committed-to-master version use:

```sh
bower install angular-material#master 
```

To save the bower settings for future use:

```bash
bower install angular-material --save
```

Later, you can use easily update with:

```bash
bower update
```

> Please note that using Angular Material requires **Angular 1.3.x** or higher.


### Using the Bower-Material Library

Now that you have installed [locally] the Angular libraries, simply include the scripts and stylesheet in your main HTML file:

```html
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="/bower_components/angular-material/angular-material.css">
</head>
	<body ng-app="YourApp">

	<div ng-controller="YourController">

	</div>

	<script src="/bower_components/angular/angular.js"></script>
	<script src="/bower_components/angular-aria/angular-aria.js"></script>
	<script src="/bower_components/angular-animate/angular-animate.js"></script>
	<script src="/bower_components/hammerjs/hammer.js"></script>
	<script src="/bower_components/angular-material/angular-material.js"></script>
	<script>

		// Include app dependency on ngMaterial

		angular.module( 'YourApp', [ 'ngMaterial' ] )
			.controller("YourController", YourController );

	</script>

</body>
</html>
```
