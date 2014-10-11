## bower-material

This repository contains the Bower release of [angular-material](https://github.com/angular/material).

### Installing Angular-Material

> Please note that using Angular Material requires **Angular 1.3.x** or higher.

Below is a sample set of commands:

```bash
cd yourProjectDir
bower install angular-material --save
```

### Usage

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
	<script src="/bower_components/angular-animate/angular-animate.js"></script>
	<script src="/bower_components/hammerjs/hammer.js"></script>
	<script src="/bower_components/angular-material/angular-material.js"></script>
	<script>

		// Include app dependencies on ngAnimate and ngMaterial

		angular.module( 'YourApp', [ 'ngAnimate', 'ngAria', 'ngMaterial' ] )
			.controller("YourController", YourController );

	</script>

</body>
</html>
```
