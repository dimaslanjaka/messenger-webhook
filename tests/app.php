<?php
'use strict';
$PAGE_ACCESS_TOKEN = $process->env->PAGE_ACCESS_TOKEN;
$request = require('request');
$express = require('express');
$body_parser = require('body-parser');
$app = $express()->use($body_parser->json());
$app->listen($process->env->PORT || 1337, function () {
$console->log('webhook is listening')}
);
$app->post('/webhook', function ($req, $res) {
$body = $req->body;
if ($body->object === 'page') {
$body->entry->forEach(function ($entry) {
$webhook_event = $entry->messaging[0];
$console->log($webhook_event);
$sender_psid = $webhook_event->sender->id;
$console->log('Sender ID: ' + $sender_psid);
if ($webhook_event->message) {
handleMessage($sender_psid, $webhook_event->message);
} else if ($webhook_event->postback) {
handlePostback($sender_psid, $webhook_event->postback);
}}
);
$res->status(200)->send('EVENT_RECEIVED');
} else {$res->sendStatus(404);
}}
);
$app->get('/webhook', function ($req, $res) {
$VERIFY_TOKEN = "dimaslanjaka";
$mode = $req->query['hub.mode'];
$token = $req->query['hub.verify_token'];
$challenge = $req->query['hub.challenge'];
if ($mode && $token) {
if ($mode === 'subscribe' && $token === $VERIFY_TOKEN) {
$console->log('WEBHOOK_VERIFIED');
$res->status(200)->send($challenge);
} else {$res->sendStatus(403);
}}}
);
function handleMessage($sender_psid, $received_message) {
$response = null;
$console->log($received_message);
if ($received_message->text) {
$response = array("text" => "You sent the message: "". Now send me an attachment!{$received_message->text}");
} else if ($received_message->attachments) {
$attachment_url = $received_message->attachments[0]->payload->url;
$response = array("attachment" => array("type" => "template", "payload" => array("template_type" => "generic", "elements" => array(array("title" => "Is this the right picture?", "subtitle" => "Tap a button to answer.", "image_url" => $attachment_url, "buttons" => array(array("type" => "postback", "title" => "Yes!", "payload" => "yes"), array("type" => "postback", "title" => "No!", "payload" => "no")))))));
}callSendAPI($sender_psid, $response);
}
function handlePostback($sender_psid, $received_postback) {
$console->log('ok');
$response = null;
$payload = $received_postback->payload;
if ($payload === 'yes') {
$response = array("text" => "Thanks!");
} else if ($payload === 'no') {
$response = array("text" => "Oops, try sending another image.");
} else if (array_search("number phone", $payload) > -1) {
$response = array("text" => "My Number Phone 085655667573 (Whatsapp available).");
} else if ($payload === 'GET_STARTED') {
} else if (array_search("available to chat", $payload) > -1) {
$response = array("text" => "Of course, may i help you. lets talking!");
}callSendAPI($sender_psid, $response);
}
function callSendAPI($sender_psid, $response) {
global $request;
global $PAGE_ACCESS_TOKEN;$request_body = array("recipient" => array("id" => $sender_psid), "message" => $response);
$request(array("uri" => "https://graph.facebook.com/v2.8/me/messages", "qs" => array("access_token" => $PAGE_ACCESS_TOKEN), "method" => "POST", "json" => $request_body), function ($err, $res, $body) {
if (!$err) {
$console->log('message sent!');
} else if ($err) {
$console->error("Unable to send message:" + $err);
}}
);
}

