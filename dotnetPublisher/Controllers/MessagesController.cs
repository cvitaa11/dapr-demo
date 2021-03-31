using Dapr;
using Dapr.Client;
using dotnetPublisher.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dotnetPublisher.Controllers
{    
    [Route("[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {

        private readonly DaprClient daprClient = new DaprClientBuilder().Build();

        [Topic("kafka-pubsub", "newMessage")]
        [HttpPost]
        public async Task<ActionResult> CreateMessage(Message msg)
        {
            await daprClient.PublishEventAsync<Message>("kafka-pubsub", "newMessage", msg);

            return Ok(new { response = "Successfully published message." });
        }
    }
}
