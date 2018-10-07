API Project: URL Shortener Microservice
User Stories
I can POST a URL to [project_url]/api/shorturl/new and I will receive a shortened URL in the JSON response. Example : {"original_url":"www.google.com","short_url":1}
If I pass an invalid URL that doesn't follow the valid http(s)://www.example.com(/more/routes) format, the JSON response will contain an error like {"error":"invalid URL"}
When I visit the shortened URL, it will redirect me to my original link.
Creation Example:
POST [project_url]/api/shorturl/new - body (urlencoded) : url=https://www.google.com

response : {"originalUrl": "https://www.google.com", "shortUrl": 1 }

Usage:
[this_project_url]/api/shorturl/1 

Will redirect to:

https://www.google.com


Flow:
Encoded url is posted to the backend
Regular expression in used to validate that the appropriate url is posted
If it conforms, the domain module is used to check if the domain name is active.
Once confirmed, the server initiates the domain name storage process.
Two collections are created, one to store the counter of the shorturl and another to store the original url and its associated shortUrl.