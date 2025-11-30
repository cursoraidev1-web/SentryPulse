<?php

use App\Core\Router;

$router = app(Router::class);

$router->post('/auth/register', 'AuthController@register');
$router->post('/auth/login', 'AuthController@login');
$router->get('/auth/me', 'AuthController@me');
$router->post('/auth/refresh', 'AuthController@refresh');
$router->put('/auth/profile', 'AuthController@updateProfile');

$router->get('/teams', 'TeamController@index');
$router->get('/teams/{id}', 'TeamController@show');
$router->post('/teams', 'TeamController@store');
$router->put('/teams/{id}', 'TeamController@update');
$router->post('/teams/{id}/members', 'TeamController@addMember');
$router->delete('/teams/{id}/members/{userId}', 'TeamController@removeMember');

$router->get('/monitors', 'MonitorController@index');
$router->get('/monitors/{id}', 'MonitorController@show');
$router->post('/monitors', 'MonitorController@store');
$router->put('/monitors/{id}', 'MonitorController@update');
$router->delete('/monitors/{id}', 'MonitorController@destroy');
$router->get('/monitors/{id}/checks', 'MonitorController@checks');
$router->post('/monitors/{id}/check', 'MonitorController@runCheck');

$router->get('/incidents', 'IncidentController@index');
$router->get('/incidents/{id}', 'IncidentController@show');
$router->put('/incidents/{id}', 'IncidentController@update');
$router->post('/incidents/{id}/resolve', 'IncidentController@resolve');
$router->get('/monitors/{monitorId}/incidents', 'IncidentController@monitorIncidents');

$router->get('/status-pages', 'StatusPageController@index');
$router->get('/status-pages/{id}', 'StatusPageController@show');
$router->get('/status/{slug}', 'StatusPageController@showBySlug');
$router->post('/status-pages', 'StatusPageController@store');
$router->put('/status-pages/{id}', 'StatusPageController@update');
$router->delete('/status-pages/{id}', 'StatusPageController@destroy');
$router->post('/status-pages/{id}/monitors', 'StatusPageController@addMonitor');
$router->delete('/status-pages/{id}/monitors/{monitorId}', 'StatusPageController@removeMonitor');

$router->get('/analytics/sites', 'AnalyticsController@sites');
$router->get('/analytics/sites/{id}', 'AnalyticsController@showSite');
$router->post('/analytics/sites', 'AnalyticsController@createSite');
$router->put('/analytics/sites/{id}', 'AnalyticsController@updateSite');
$router->delete('/analytics/sites/{id}', 'AnalyticsController@deleteSite');
$router->get('/analytics/sites/{id}/stats', 'AnalyticsController@stats');
$router->post('/analytics/collect', 'AnalyticsController@collect');

return $router;
