using Dapr;
using Dapr.Client;
using dotnetConsumer.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace dotnetConsumer.Controllers
{
    [Route("[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly DaprClient daprClient = new DaprClientBuilder().Build();

        [Topic("kafka-pubsub", "newMessage")]
        [HttpPost]
        public async Task<ActionResult> ConsumeMsgAndStoreInRedis(Message msg)
        {
            try
            {
                await daprClient.SaveStateAsync("statestore", "message",msg);
                return Ok("Saved state successfully");
            }
            catch (Exception e)
            {
                return StatusCode(400, new { res = e });
            }
        }
    }
}
