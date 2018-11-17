<?php
require __DIR__ .'/vendor/autoload.php';
header("Content-type: application/json; charset=utf-8");

use \Curl\Curl;
$curl = new Curl();
$token = "EAACl4IDNDgkBAASg4yGt5gomwZCdfnupIloe43peFsCDOpR1qenZArYcVZBgHvmMUWczRTgr18iQXUDKAwp9XECAAx1ZCbL4jbPVroe6UWnqCwPBEG5WCrAwGKrGoohKmM7iTC9oD32jMLtSzgPORxeMjIXEqJDZCUWkZC0SBZCz49d2F89GyxwGK07yRwqiBBrl3vBDnVNTwZDZD";
$app_secret = "3eaaa07b6c6dcd76ad47de0979e112c7";
$app_id = "182383652179465";

$fb = new \Facebook\Facebook([
  'app_id' => $app_id,
  'app_secret' => $app_secret,
  'default_graph_version' => 'v3.2',
  'default_access_token' => $token, // optional
]);

// Use one of the helper classes to get a Facebook\Authentication\AccessToken entity.
//   $helper = $fb->getRedirectLoginHelper();
//   $helper = $fb->getJavaScriptHelper();
//   $helper = $fb->getCanvasHelper();
//   $helper = $fb->getPageTabHelper();
function req($api='/me', $token=false){
  global $fb;
  if (false == $token){
    global $token;
  }
try {
  $response = $fb->get($api, $token);
  return $response;
} catch(\Facebook\Exceptions\FacebookResponseException $e) {
  echo 'Graph returned an error: ' . $e->getMessage();
  exit;
} catch(\Facebook\Exceptions\FacebookSDKException $e) {
  echo 'Facebook SDK returned an error: ' . $e->getMessage();
  exit;
}
}
//$me = $response->getGraphUser();
//echo 'Page Name: ' . $me->getName();
//echo req('/me')->getGraphUser()->getName();
$inbox = req('/me/conversations');
$inbox_list = $inbox->getBody();
foreach (json_decode($inbox_list,true)["data"] as $data){
  $id = $data["id"];
  echo req("/$id/?fields=messages{message}")->getBody();
}