	// create the module and name it scotchApp
	var app = angular.module('app', ['ngRoute', 'ngResource']);

	app.factory('Projects', ['$resource', function($resource) {
		return $resource('http://localhost:5000/api/users/:id/projects', {id: '@id'},
	    {
	        'query': { method:'GET', isArray: false }
	    });
	}]);

	app.factory('Branches', ['$resource', function($resource) {
		return $resource('http://localhost:5000/api/users/:id/projects/:repo/branches', {id: '@id', repo: '@repo'},
	    {
	        'query': { method:'GET', isArray: false }
	    });
	}]);

	app.factory('Revisions', ['$resource', function($resource) {
		return $resource('http://localhost:5000/api/users/:id/projects/:repo/:branch/statistic', {id: '@id', repo: '@repo', branch: '@branch'},
	    {
	        'query': { method:'GET', isArray: false }
	    });
	}]);

	// configure our routes
	app.config(function($routeProvider) {
		$routeProvider

			// route for the home page
			.when('/', {
				templateUrl : 'pages/project.html',
				controller  : 'projectsController'
			})

			// route for the about page
			.when('/statistic', {
				templateUrl : 'pages/statistic.html',
				controller  : 'statisticController'
			})

			// route for the contact page
			.when('/projects', {
				templateUrl : 'pages/project.html',
				controller  : 'projectsController'
			})

			// route for the contact page
			.when('/projects/:repo', {
				templateUrl : 'pages/branches.html',
				controller  : 'branchesController'
			})

			// route for the contact page
			.when('/projects/:repo/:branch', {
				templateUrl : 'pages/status.html',
				controller  : 'statusController'
			});
	});

	app.config(['$httpProvider', function($httpProvider) {
	    //initialize get if not there
	    if (!$httpProvider.defaults.headers.get) {
	        $httpProvider.defaults.headers.get = {};    
	    }    

	    // Answer edited to include suggestions from comments
	    // because previous version of code introduced browser-related errors

	    //disable IE ajax request caching
	    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
	    // extra
	    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
	    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
	}]);

	// create the controller and inject Angular's $scope
	app.controller('mainController', function($scope) {
		// create a message to display in our view
		$scope.message = 'Everyone come and see how good I look!';
	});

	app.controller('statisticController', function($scope) {
		$scope.message = 'Oleh Kuprovskyi activity.';
	});

	app.controller('projectsController', ['$scope', 'Projects', function($scope, Projects) {
    	$scope.message = 'Projects assigned to user.';

    	$scope.projects = Projects.query({ id:1 });
	}]);

	app.controller('branchesController', ['$scope', '$routeParams', 'Branches', function($scope, $routeParams, Branches) {
    	$scope.message = 'Branches from project ' + $routeParams.repo;

    	$scope.branches = Branches.query({ id: 1, repo: $routeParams.repo });
	}]);

	app.controller('statusController', ['$scope', '$routeParams', 'Revisions', function($scope, $routeParams, Revisions) {
    	$scope.message = 'Project ' + $routeParams.repo + ' branch ' + $routeParams.branch + ' status';

    	Revisions.query({ id: 1, repo: $routeParams.repo, branch: $routeParams.branch }, function(resp){
    		$scope.status = resp;
    		var config = {
		        type: 'doughnut',
		        data: {
		            datasets: [{
		                data: [
		                    resp.builds.master_after_merge.failed,
		                    resp.builds.master_after_merge.success
		                ],
		                backgroundColor: [
		                    window.chartColors.red,
		                    window.chartColors.green
		                ],
		                label: 'Dataset 1'
		            }],
		            labels: [
		                "Failed " + resp.builds.master_after_merge.failed,
		                "Success " + resp.builds.master_after_merge.success
		            ]
		        },
		        options: {
		            responsive: true,
		            legend: {
		                position: 'top',
		            },
		            title: {
		                display: true,
		                text: 'Builds after merge to master'
		            },
		            animation: {
		                animateScale: true,
		                animateRotate: true
		            }
		        }
		    };

		    var config2 = {
		        type: 'doughnut',
		        data: {
		            datasets: [{
		                data: [
		                    resp.builds.failed,
		                    resp.builds.success
		                ],
		                backgroundColor: [
		                    window.chartColors.red,
		                    window.chartColors.green
		                ],
		                label: 'Dataset 1'
		            }],
		            labels: [
		                "Failed " + resp.builds.failed,
		                "Success " + resp.builds.success
		            ]
		        },
		        options: {
		            responsive: true,
		            legend: {
		                position: 'top',
		            },
		            title: {
		                display: true,
		                text: 'Feature builds'
		            },
		            animation: {
		                animateScale: true,
		                animateRotate: true
		            }
		        }
		    };

	        var chartArea = document.getElementById("chart-area");
	        if (chartArea) {
	        	var ctx = document.getElementById("chart-area").getContext("2d");
	        	window.myDoughnut = new Chart(ctx, config);
	        }

	        var ctx2 = document.getElementById("chart-area2").getContext("2d");
	        window.myDoughnut2 = new Chart(ctx2, config2);

    	});
	}]);
