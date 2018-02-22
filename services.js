var services = angular.module('services', [])

// custom factories
.factory('Projects', ['$resource', function ($resource) {
    var resource = $resource('api/users/:id/projects', {id: '@id'}, {
        query: {method: 'GET', isArray: true}
    });

    return resource;
}])