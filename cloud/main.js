
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:

var Option = Parse.Object.extend("Option");
var Vote = Parse.Object.extend("Vote");
var VoteResult = Parse.Object.extend("VoteResult");

Parse.Cloud.beforeSave("Vote", function(request, response) {
  // check object contain all information we needs
  if (!request.user) response.error("user must login");
  if (!request.object.get("option")) response.error("you must provide option");

  var q = new Parse.Query(Vote);
  q.equalTo("user", request.user);
  q.equalTo("option", request.object.get("option"));

  q.first({
    success: function(vote) {
      if(vote) {
        response.error("user vote this option already");
        return;
      }
      request.object.set("user", request.user);
      response.success();
    },
    error: function(vote, error) {
      response.error(error);
    }
  });
});

Parse.Cloud.afterSave("Vote", function(request) {
  var candidate = request.object.get("candidate");
  var q = new Parse.Query(VoteResult);
  q.equalTo("candidate", candidate);

  q.first({
    success: function(voteresult) {
      if(!voteresult) {
        response.error("no such candidate");
        return;
      }
      voteresult.set("votes", voteresult.get("votes") + 1);
      voteresult.save(null, {
        success: function(voteresult) {
          // response.success("update vote result success");
        },
        error: function(voteresult, error) {

        }
      });
    }
  })
});

