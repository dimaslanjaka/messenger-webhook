<?php
function callSendAPI($sender_id, $response) {
$request_body = array("recipient" => array("id" => $sender_id), "message" => $response);
request(array("uri" => "https://graph.facebook.com/v2.8/me/messages", "qs" => array("access_token" => $PAGE_ACCESS_TOKEN), "method" => "POST", "json" => $request_body), function ($err, $res, $body) {
if (!$err) {
$console->log('message sent!');
} else if ($err) {
$console->error("Unable to send message:" + $err);
}}
);
}

