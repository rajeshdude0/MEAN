/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var app = angular.module('weekDemo', ['ui.router']);
app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('home', {
    url: '/home',
    templateUrl: '/home.html',
    controller: 'MainController',
    resolve: {
      postPromise: ['posts', function (posts) {
        return posts.getAll();
      }]
    }
  }).state('post', {
    url: '/posts/{id}',
    templateUrl: '/posts.html',
    controller: 'PostsController',
    resolve: {
      post: ['$stateParams', 'posts', function ($stateParams, posts) {
        return posts.get($stateParams.id);
      }]
    }
  }).state('login', {
    url: '/login',
    templateUrl: '/login.html',
    controller: 'AuthenticationController',
    onEnter: ['$state', 'auth', function ($state, auth) {
      if (auth.isLoggedIn()) {
        $state.go('home');
      }
    }]
  }).state('register', {
    url: '/register',
    templateUrl: '/register.html',
    controller: 'AuthenticationController',
    onEnter: ['$state', 'auth', function ($state, auth) {
      if (auth.isLoggedIn()) {
        $state.go('home');
      }
    }]
  });

  $urlRouterProvider.otherwise('home');
}]);

app.factory('posts', ['$http', 'auth', function ($http, auth) {
  var o = {
    posts: []
  };
  o.getAll = function () {
    return $http.get('/posts').success(function (data) {
      angular.copy(data, o.posts);
    });
  };
  o.create = function (post) {
    return $http.post('/posts', post, {
      headers: { Authorization: 'Bearer ' + auth.getToken() }
    }).success(function (data) {

      o.posts.push(data);
    });
  };

  o.addComment = function (id, comment) {
    return $http.post('/posts/' + id + '/comments', comment, {
      headers: { Authorization: 'Bearer ' + auth.getToken() }
    });
  };

  o.upvote = function (post) {
    return $http.put('/posts/' + post._id + '/upvote', null, {
      headers: { Authorization: 'Bearer ' + auth.getToken() }
    }).success(function (data) {
      post.upvotes += 1;
    });
  };

  o.upvoteComment = function (post, comment) {

    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
      headers: { Authorization: 'Bearer ' + auth.getToken() }
    }).success(function (data) {

      comment.upvotes += 1;
    });
  };

  o.get = function (id) {
    return $http.get('/posts/' + id).then(function (res) {
      return res.data;
    });
  };

  return o;
}]).factory('auth', ['$http', '$window', function ($http, $window) {
  var auth = {};
  auth.saveToken = function (token) {
    $window.localStorage['week-demo'] = token;
  };
  auth.getToken = function () {
    return $window.localStorage['week-demo'];
  };

  auth.isLoggedIn = function () {
    var token = auth.getToken();
    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  auth.currentUser = function () {
    if (auth.isLoggedIn()) {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  };

  auth.permissions = function () {
    if (auth.isLoggedIn()) {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      console.log(JSON.parse($window.atob(token.split('.')[1])));
      console.log(payload.permissions);
      return payload.permissions;
    }
  };
  auth.register = function (user) {
    return $http.post('/register', user).success(function (data) {
      auth.saveToken(data.token);
    });
  };

  auth.logIn = function (user) {
    return $http.post('/login', user).success(function (data) {
      auth.saveToken(data.token);
    });
  };

  auth.logOut = function () {
    $window.localStorage.removeItem('week-demo');
  };
  return auth;
}]);

app.controller('PostsController', ['$scope', 'posts', 'post', 'auth', function ($scope, posts, post, auth) {
  $scope.post = post;
  console.log(post.comments);
  $scope.incrementUpvotes = function (comment) {
    //console.log(comment);
    //console.log(post);
    ///  comment.upvotes += 1;
    posts.upvoteComment(post, comment);
  };
  $scope.addComment = function () {
    if ($scope.body === '') {
      return;
    }
    posts.addComment(post._id, {
      body: $scope.body,
      author: 'user'
    }).success(function (comment) {
      $scope.post.comments.push(comment);
    });
    $scope.body = '';
  };

  $scope.isLoggedIn = auth.isLoggedIn;
}]);
app.controller('MainController', ['$scope', 'posts', 'auth', function ($scope, posts, auth) {
  $scope.test = "hello this is my world";
  $scope.posts = posts.posts;
  console.log(posts.posts);

  $scope.addPost = function () {
    if (!$scope.title || $scope.title === '') {
      return;
    }
    posts.create({
      title: $scope.title,
      link: $scope.link
    });
    $scope.title = '';
    $scope.link = '';
  };

  $scope.incrementUpvotes = function (post) {
    posts.upvote(post);
  };

  $scope.isLoggedIn = auth.isLoggedIn;
}]);

app.controller('AuthenticationController', ['$scope', '$state', 'auth', function ($scope, $state, auth) {
  $scope.user = {};
  $scope.register = function () {
    auth.register($scope.user).error(function (error) {
      $scope.error = error;
    }).then(function () {
      $state.go('home');
    });
  };

  $scope.logIn = function () {
    auth.logIn($scope.user).error(function (error) {
      $scope.error = error;
    }).then(function () {

      console.log(auth.permissions());
      $state.go('home');
    });
  };

  $scope.isLoggedIn = auth.isLoggedIn;
}]);

app.controller('NavCtrl', ['$scope', 'auth', function ($scope, auth) {
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;
}]);

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDE2OGY3NDg2ZTZjNjAyM2U5N2MiLCJ3ZWJwYWNrOi8vLy4vcHVibGljL2phdmFzY3JpcHRzL2FuZ3VsYXJBcHAuanMiXSwibmFtZXMiOlsiYXBwIiwiYW5ndWxhciIsIm1vZHVsZSIsImNvbmZpZyIsIiRzdGF0ZVByb3ZpZGVyIiwiJHVybFJvdXRlclByb3ZpZGVyIiwic3RhdGUiLCJ1cmwiLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJyZXNvbHZlIiwicG9zdFByb21pc2UiLCJwb3N0cyIsImdldEFsbCIsInBvc3QiLCIkc3RhdGVQYXJhbXMiLCJnZXQiLCJpZCIsIm9uRW50ZXIiLCIkc3RhdGUiLCJhdXRoIiwiaXNMb2dnZWRJbiIsImdvIiwib3RoZXJ3aXNlIiwiZmFjdG9yeSIsIiRodHRwIiwibyIsInN1Y2Nlc3MiLCJkYXRhIiwiY29weSIsImNyZWF0ZSIsImhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwiZ2V0VG9rZW4iLCJwdXNoIiwiYWRkQ29tbWVudCIsImNvbW1lbnQiLCJ1cHZvdGUiLCJwdXQiLCJfaWQiLCJ1cHZvdGVzIiwidXB2b3RlQ29tbWVudCIsInRoZW4iLCJyZXMiLCIkd2luZG93Iiwic2F2ZVRva2VuIiwidG9rZW4iLCJsb2NhbFN0b3JhZ2UiLCJwYXlsb2FkIiwiSlNPTiIsInBhcnNlIiwiYXRvYiIsInNwbGl0IiwiZXhwIiwiRGF0ZSIsIm5vdyIsImN1cnJlbnRVc2VyIiwidXNlcm5hbWUiLCJwZXJtaXNzaW9ucyIsImNvbnNvbGUiLCJsb2ciLCJyZWdpc3RlciIsInVzZXIiLCJsb2dJbiIsImxvZ091dCIsInJlbW92ZUl0ZW0iLCIkc2NvcGUiLCJjb21tZW50cyIsImluY3JlbWVudFVwdm90ZXMiLCJib2R5IiwiYXV0aG9yIiwidGVzdCIsImFkZFBvc3QiLCJ0aXRsZSIsImxpbmsiLCJlcnJvciJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFF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LFlBQVU7QUFDdkIzQyxTQUFLMkMsS0FBTCxDQUFXRyxPQUFPSixJQUFsQixFQUF3QmEsS0FBeEIsQ0FBOEIsVUFBU0EsS0FBVCxFQUFlO0FBQzNDVCxhQUFPUyxLQUFQLEdBQWVBLEtBQWY7QUFDRCxLQUZELEVBRUdqQyxJQUZILENBRVEsWUFBVTs7QUFFaEJpQixjQUFRQyxHQUFSLENBQVl4QyxLQUFLc0MsV0FBTCxFQUFaO0FBQ0F2QyxhQUFPRyxFQUFQLENBQVUsTUFBVjtBQUNELEtBTkQ7QUFPRCxHQVJEOztBQVVBNEMsU0FBTzdDLFVBQVAsR0FBb0JELEtBQUtDLFVBQXpCO0FBRUYsQ0F0QnlDLENBQTFDOztBQXdCQXJCLElBQUlTLFVBQUosQ0FBZSxTQUFmLEVBQTBCLENBQzFCLFFBRDBCLEVBRTFCLE1BRjBCLEVBRzFCLFVBQVN5RCxNQUFULEVBQWlCOUMsSUFBakIsRUFBc0I7QUFDcEI4QyxTQUFPN0MsVUFBUCxHQUFvQkQsS0FBS0MsVUFBekI7QUFDQTZDLFNBQU9WLFdBQVAsR0FBcUJwQyxLQUFLb0MsV0FBMUI7QUFDQVUsU0FBT0YsTUFBUCxHQUFnQjVDLEtBQUs0QyxNQUFyQjtBQUNELENBUHlCLENBQTFCLEUiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiL1wiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDQxNjhmNzQ4NmU2YzYwMjNlOTdjIiwidmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCd3ZWVrRGVtbycsWyd1aS5yb3V0ZXInXSk7XG5hcHAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCckdXJsUm91dGVyUHJvdmlkZXInLFxuICBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwkdXJsUm91dGVyUHJvdmlkZXIpe1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAuc3RhdGUoJ2hvbWUnLHtcbiAgICAgICAgdXJsOicvaG9tZScsXG4gICAgICAgIHRlbXBsYXRlVXJsOicvaG9tZS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjonTWFpbkNvbnRyb2xsZXInLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgcG9zdFByb21pc2U6IFsncG9zdHMnLCBmdW5jdGlvbihwb3N0cyl7XG4gICAgICAgcmV0dXJuIHBvc3RzLmdldEFsbCgpO1xuICAgICAgfV1cbiAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ3Bvc3QnLHtcbiAgICAgICAgdXJsOicvcG9zdHMve2lkfScsXG4gICAgICAgIHRlbXBsYXRlVXJsOicvcG9zdHMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6J1Bvc3RzQ29udHJvbGxlcicsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICBwb3N0OiBbJyRzdGF0ZVBhcmFtcycsICdwb3N0cycsIGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgcG9zdHMpIHtcbiAgICAgIHJldHVybiBwb3N0cy5nZXQoJHN0YXRlUGFyYW1zLmlkKTtcbiAgICB9XVxuICB9XG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoZW50aWNhdGlvbkNvbnRyb2xsZXInLFxuICAgICAgICBvbkVudGVyOiBbJyRzdGF0ZScsICdhdXRoJywgZnVuY3Rpb24oJHN0YXRlLCBhdXRoKXtcbiAgICAgICAgICBpZihhdXRoLmlzTG9nZ2VkSW4oKSl7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgICB9KVxuICAgICAgLnN0YXRlKCdyZWdpc3RlcicsIHtcbiAgICAgICAgdXJsOiAnL3JlZ2lzdGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICcvcmVnaXN0ZXIuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoZW50aWNhdGlvbkNvbnRyb2xsZXInLFxuICAgICAgICBvbkVudGVyOiBbJyRzdGF0ZScsICdhdXRoJywgZnVuY3Rpb24oJHN0YXRlLCBhdXRoKXtcbiAgICAgICAgICBpZihhdXRoLmlzTG9nZ2VkSW4oKSl7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1dXG4gICAgICB9KTtcblxuXG4gICAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdob21lJyk7XG4gIH1cbl0pXG5cblxuXG5cbmFwcC5mYWN0b3J5KCdwb3N0cycsWyckaHR0cCcsJ2F1dGgnLGZ1bmN0aW9uKCRodHRwLGF1dGgpe1xuICB2YXIgbyA9IHtcbiAgICBwb3N0czpbXVxuICB9O1xuICBvLmdldEFsbCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkaHR0cC5nZXQoJy9wb3N0cycpLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICBhbmd1bGFyLmNvcHkoZGF0YSwgby5wb3N0cyk7XG4gICAgfSk7XG4gIH07XG4gIG8uY3JlYXRlID0gZnVuY3Rpb24ocG9zdCkge1xuICByZXR1cm4gJGh0dHAucG9zdCgnL3Bvc3RzJywgcG9zdCx7XG4gICAgaGVhZGVyczoge0F1dGhvcml6YXRpb246ICdCZWFyZXIgJythdXRoLmdldFRva2VuKCl9XG4gIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG5cbiAgICBvLnBvc3RzLnB1c2goZGF0YSk7XG4gIH0pO1xufTtcblxuICBvLmFkZENvbW1lbnQgPSBmdW5jdGlvbihpZCwgY29tbWVudCkge1xuICByZXR1cm4gJGh0dHAucG9zdCgnL3Bvc3RzLycgKyBpZCArICcvY29tbWVudHMnLCBjb21tZW50LHtcbiAgICBoZWFkZXJzOiB7QXV0aG9yaXphdGlvbjogJ0JlYXJlciAnK2F1dGguZ2V0VG9rZW4oKX1cbiAgfSk7XG59O1xuXG5cblxuby51cHZvdGUgPSBmdW5jdGlvbihwb3N0KSB7XG4gIHJldHVybiAkaHR0cC5wdXQoJy9wb3N0cy8nICsgcG9zdC5faWQgKyAnL3Vwdm90ZScsbnVsbCx7XG4gICAgaGVhZGVyczoge0F1dGhvcml6YXRpb246ICdCZWFyZXIgJythdXRoLmdldFRva2VuKCl9XG4gIH0pXG4gICAgLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSl7XG4gICAgICBwb3N0LnVwdm90ZXMgKz0gMTtcbiAgICB9KTtcbn07XG5cbm8udXB2b3RlQ29tbWVudCA9IGZ1bmN0aW9uKHBvc3QsIGNvbW1lbnQpIHtcblxuICByZXR1cm4gJGh0dHAucHV0KCcvcG9zdHMvJyArIHBvc3QuX2lkICsgJy9jb21tZW50cy8nKyBjb21tZW50Ll9pZCArICcvdXB2b3RlJyxudWxsLHtcbiAgICBoZWFkZXJzOiB7QXV0aG9yaXphdGlvbjogJ0JlYXJlciAnK2F1dGguZ2V0VG9rZW4oKX1cbiAgfSlcbiAgICAuc3VjY2VzcyhmdW5jdGlvbihkYXRhKXtcblxuICAgICAgY29tbWVudC51cHZvdGVzICs9IDE7XG4gICAgfSk7XG59O1xuXG5vLmdldCA9IGZ1bmN0aW9uKGlkKSB7XG4gIHJldHVybiAkaHR0cC5nZXQoJy9wb3N0cy8nICsgaWQpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICByZXR1cm4gcmVzLmRhdGE7XG4gIH0pO1xufTtcblxuICByZXR1cm4gbztcbn1dKVxuLmZhY3RvcnkoJ2F1dGgnLFsnJGh0dHAnLCckd2luZG93JyxmdW5jdGlvbigkaHR0cCwkd2luZG93KXtcbiAgIHZhciBhdXRoID0ge307XG4gICBhdXRoLnNhdmVUb2tlbiA9IGZ1bmN0aW9uKHRva2VuKXtcbiAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2VbJ3dlZWstZGVtbyddPSB0b2tlbjtcbiAgIH07XG4gICBhdXRoLmdldFRva2VuID0gZnVuY3Rpb24oKXtcbiAgICAgcmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlWyd3ZWVrLWRlbW8nXTtcbiAgIH1cblxuICAgYXV0aC5pc0xvZ2dlZEluID0gZnVuY3Rpb24oKXtcbiAgICAgdmFyIHRva2VuID0gYXV0aC5nZXRUb2tlbigpO1xuICAgICBpZih0b2tlbil7XG4gICAgICAgdmFyIHBheWxvYWQgPSBKU09OLnBhcnNlKCR3aW5kb3cuYXRvYih0b2tlbi5zcGxpdCgnLicpWzFdKSk7XG5cbiAgICAgICByZXR1cm4gcGF5bG9hZC5leHAgPiBEYXRlLm5vdygpIC8gMTAwMDtcbiAgICAgfSBlbHNle1xuICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgfVxuICAgfTtcblxuICAgYXV0aC5jdXJyZW50VXNlciA9IGZ1bmN0aW9uKCl7XG4gICAgIGlmKGF1dGguaXNMb2dnZWRJbigpKXtcbiAgICAgICB2YXIgdG9rZW4gPSBhdXRoLmdldFRva2VuKCk7XG4gICAgICAgdmFyIHBheWxvYWQgPSBKU09OLnBhcnNlKCR3aW5kb3cuYXRvYih0b2tlbi5zcGxpdCgnLicpWzFdKSk7XG5cbiAgICAgICByZXR1cm4gcGF5bG9hZC51c2VybmFtZTtcbiAgICAgfVxuICAgfTtcblxuICAgYXV0aC5wZXJtaXNzaW9ucyA9IGZ1bmN0aW9uKCl7XG4gICAgIGlmKGF1dGguaXNMb2dnZWRJbigpKXtcbiAgICAgICB2YXIgdG9rZW4gPSBhdXRoLmdldFRva2VuKCk7XG4gICAgICAgdmFyIHBheWxvYWQgPSBKU09OLnBhcnNlKCR3aW5kb3cuYXRvYih0b2tlbi5zcGxpdCgnLicpWzFdKSk7XG4gICAgICAgY29uc29sZS5sb2coSlNPTi5wYXJzZSgkd2luZG93LmF0b2IodG9rZW4uc3BsaXQoJy4nKVsxXSkpKTtcbiAgICAgICBjb25zb2xlLmxvZyhwYXlsb2FkLnBlcm1pc3Npb25zKTtcbiAgICAgICByZXR1cm4gcGF5bG9hZC5wZXJtaXNzaW9ucztcbiAgICAgfVxuICAgfVxuICAgYXV0aC5yZWdpc3RlciA9IGZ1bmN0aW9uKHVzZXIpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL3JlZ2lzdGVyJywgdXNlcikuc3VjY2VzcyhmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRhdXRoLnNhdmVUb2tlbihkYXRhLnRva2VuKTtcblx0XHR9KTtcblx0fTtcblxuICAgYXV0aC5sb2dJbiA9IGZ1bmN0aW9uKHVzZXIpe1xuICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJyx1c2VyKS5zdWNjZXNzKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgIGF1dGguc2F2ZVRva2VuKGRhdGEudG9rZW4pO1xuICAgICB9KTtcbiAgIH07XG5cbiAgYXV0aC5sb2dPdXQgPSBmdW5jdGlvbigpe1xuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3dlZWstZGVtbycpO1xuICB9XG4gICByZXR1cm4gYXV0aDtcbn1dKVxuXG5cbmFwcC5jb250cm9sbGVyKCdQb3N0c0NvbnRyb2xsZXInLFsnJHNjb3BlJywncG9zdHMnLCdwb3N0JywnYXV0aCcsZnVuY3Rpb24oJHNjb3BlLHBvc3RzLHBvc3QsYXV0aCl7XG4gICRzY29wZS5wb3N0ID0gcG9zdDtcbiAgY29uc29sZS5sb2cocG9zdC5jb21tZW50cyk7XG4gICRzY29wZS5pbmNyZW1lbnRVcHZvdGVzID0gZnVuY3Rpb24oY29tbWVudCl7XG4gICAgLy9jb25zb2xlLmxvZyhjb21tZW50KTtcbiAgIC8vY29uc29sZS5sb2cocG9zdCk7XG4gIC8vLyAgY29tbWVudC51cHZvdGVzICs9IDE7XG4gICAgcG9zdHMudXB2b3RlQ29tbWVudChwb3N0LCBjb21tZW50KTtcbn07XG4gICRzY29wZS5hZGRDb21tZW50ID0gZnVuY3Rpb24oKXtcbiAgICBpZigkc2NvcGUuYm9keSA9PT0gJycpIHsgcmV0dXJuOyB9XG4gICAgcG9zdHMuYWRkQ29tbWVudChwb3N0Ll9pZCwge1xuICAgICAgYm9keTogJHNjb3BlLmJvZHksXG4gICAgICBhdXRob3I6ICd1c2VyJyxcbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKGNvbW1lbnQpIHtcbiAgICAgICRzY29wZS5wb3N0LmNvbW1lbnRzLnB1c2goY29tbWVudCk7XG4gICAgfSk7XG4gICAgJHNjb3BlLmJvZHkgPSAnJztcbiAgfTtcblxuICAkc2NvcGUuaXNMb2dnZWRJbiA9IGF1dGguaXNMb2dnZWRJbjtcblxuXG5cblxuXG59XG5dKTtcbmFwcC5jb250cm9sbGVyKCdNYWluQ29udHJvbGxlcicsWyckc2NvcGUnLCdwb3N0cycsJ2F1dGgnLGZ1bmN0aW9uKCRzY29wZSxwb3N0cyxhdXRoKXtcbiAgICAkc2NvcGUudGVzdCA9IFwiaGVsbG8gdGhpcyBpcyBteSB3b3JsZFwiO1xuICAgICRzY29wZS5wb3N0cyA9IHBvc3RzLnBvc3RzO1xuICAgIGNvbnNvbGUubG9nKHBvc3RzLnBvc3RzKTtcblxuICAgICRzY29wZS5hZGRQb3N0ID0gZnVuY3Rpb24oKXtcbiAgICBpZighJHNjb3BlLnRpdGxlIHx8ICRzY29wZS50aXRsZSA9PT0gJycpIHsgcmV0dXJuOyB9XG4gICAgcG9zdHMuY3JlYXRlKHtcbiAgICAgIHRpdGxlOiAkc2NvcGUudGl0bGUsXG4gICAgICBsaW5rOiAkc2NvcGUubGluayxcbiAgICB9KTtcbiAgICAkc2NvcGUudGl0bGUgPSAnJztcbiAgICAkc2NvcGUubGluayA9ICcnO1xuXG4gIH07XG5cblxuICAkc2NvcGUuaW5jcmVtZW50VXB2b3RlcyA9IGZ1bmN0aW9uKHBvc3QpIHtcbiBwb3N0cy51cHZvdGUocG9zdCk7XG59O1xuXG4kc2NvcGUuaXNMb2dnZWRJbiA9IGF1dGguaXNMb2dnZWRJbjtcblxuICB9XG5dKTtcblxuYXBwLmNvbnRyb2xsZXIoJ0F1dGhlbnRpY2F0aW9uQ29udHJvbGxlcicsWyckc2NvcGUnLCckc3RhdGUnLCdhdXRoJyxmdW5jdGlvbigkc2NvcGUsJHN0YXRlLGF1dGgpe1xuICAgJHNjb3BlLnVzZXIgPSB7fTtcbiAgICRzY29wZS5yZWdpc3RlciA9IGZ1bmN0aW9uKCl7XG4gICAgIGF1dGgucmVnaXN0ZXIoJHNjb3BlLnVzZXIpLmVycm9yKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAkc2NvcGUuZXJyb3IgPSBlcnJvcjtcbiAgICAgfSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICB9KTtcbiAgIH1cblxuICAgJHNjb3BlLmxvZ0luID0gZnVuY3Rpb24oKXtcbiAgICAgYXV0aC5sb2dJbigkc2NvcGUudXNlcikuZXJyb3IoZnVuY3Rpb24oZXJyb3Ipe1xuICAgICAgICRzY29wZS5lcnJvciA9IGVycm9yO1xuICAgICB9KS50aGVuKGZ1bmN0aW9uKCl7XG5cbiAgICAgICBjb25zb2xlLmxvZyhhdXRoLnBlcm1pc3Npb25zKCkpO1xuICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICB9KTtcbiAgIH07XG5cbiAgICRzY29wZS5pc0xvZ2dlZEluID0gYXV0aC5pc0xvZ2dlZEluO1xuXG59XSk7XG5cbmFwcC5jb250cm9sbGVyKCdOYXZDdHJsJywgW1xuJyRzY29wZScsXG4nYXV0aCcsXG5mdW5jdGlvbigkc2NvcGUsIGF1dGgpe1xuICAkc2NvcGUuaXNMb2dnZWRJbiA9IGF1dGguaXNMb2dnZWRJbjtcbiAgJHNjb3BlLmN1cnJlbnRVc2VyID0gYXV0aC5jdXJyZW50VXNlcjtcbiAgJHNjb3BlLmxvZ091dCA9IGF1dGgubG9nT3V0O1xufV0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vcHVibGljL2phdmFzY3JpcHRzL2FuZ3VsYXJBcHAuanMiXSwic291cmNlUm9vdCI6IiJ9