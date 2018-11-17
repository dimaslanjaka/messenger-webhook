#https://petite-coast.glitch.me/webhook
export TOKEN="EAACl4IDNDgkBAOMPlXoQWCpcmcspdbk5a0XsTUQ46nhj81UOhmrZCNJmbbunxuHzFoZCym8a157ogrT9LZBXGdFOitwmrPyzu9Q2cwRcpWwqpXsUXENFZBwh8gxELxa9PeaJfEK3AJoGNlZCCLaQSd34mL5ZBnwzYzyx2Tl4RpRAZDZD"
curl -X POST -H "Content-Type: application/json" -d '{
  "get_started": {"payload": "GET_STARTED"}
}' "https://graph.facebook.com/v2.8/me/messenger_profile?access_token=$TOKEN"