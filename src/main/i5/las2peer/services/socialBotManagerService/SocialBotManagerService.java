package i5.las2peer.services.socialBotManagerService;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import i5.las2peer.api.Context;
import i5.las2peer.api.ManualDeployment;
import i5.las2peer.api.execution.InternalServiceException;
import i5.las2peer.api.logging.MonitoringEvent;
import i5.las2peer.api.persistency.Envelope;
import i5.las2peer.api.persistency.EnvelopeAccessDeniedException;
import i5.las2peer.api.persistency.EnvelopeNotFoundException;
import i5.las2peer.api.persistency.EnvelopeOperationFailedException;
import i5.las2peer.connectors.webConnector.client.ClientResponse;
import i5.las2peer.connectors.webConnector.client.MiniClient;
import i5.las2peer.logging.bot.BotMessage;
import i5.las2peer.p2p.Node;
import i5.las2peer.restMapper.RESTService;
import i5.las2peer.restMapper.annotations.ServicePath;
import i5.las2peer.security.BotAgent;
import i5.las2peer.security.UserAgentImpl;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import io.swagger.annotations.Contact;
import io.swagger.annotations.Info;
import io.swagger.annotations.License;
import io.swagger.annotations.SwaggerDefinition;
import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

// TODO Describe your own service
/**
 * las2peer-SocialBotManager-Service
 * 
 * This is a template for a very basic las2peer service that uses the las2peer WebConnector for RESTful access to it.
 * 
 * Note: If you plan on using Swagger you should adapt the information below in the SwaggerDefinition annotation to suit
 * your project. If you do not intend to provide a Swagger documentation of your service API, the entire Api and
 * SwaggerDefinition annotation should be removed.
 * 
 */
// TODO Adjust the following configuration
@Api
@SwaggerDefinition(
		info = @Info(
				title = "las2peer Bot Manager Service",
				version = "1.0",
				description = "A las2peer Service for managing social bots.",
				termsOfService = "",
				contact = @Contact(
						name = "Alexander Tobias Neumann",
						url = "",
						email = "neumann@dbis.rwth-aachen.de"),
				license = @License(
						name = "",
						url = "")))
@ServicePath("/SBFManager")
@ManualDeployment
public class SocialBotManagerService extends RESTService {

	private static final String ENVELOPE_MODEL = "SBF_MODELLIST";
	private static final String ENVELOPE_USER = "SBF_USERCHANNELLIST";

	private static HashMap<String, Boolean> botIsActive = new HashMap<String, Boolean>();
	private static boolean initialized = false;
	private static HashMap<String, Boolean> ready = new HashMap<String, Boolean>();

	private static BotConfiguration config;

	private static BotAgent botAgent;
	private static final String botPass = "actingAgent";
	private static Node runningAt;

	private static final String classifierName = "i5.las2peer.services.tensorFlowClassifier.TensorFlowClassifier";
	private static final String textToTextName = "i5.las2peer.services.tensorFlowTextToText.TensorFlowTextToText";

	public SocialBotManagerService() {
		super();
		setFieldValues(); // This sets the values of the configuration file
	}

	/**
	 * Template of a get function.
	 * 
	 * @return Returns an HTTP response with plain text string content.
	 */
	@POST
	@Path("/init")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "Init successful.") })
	@ApiOperation(
			value = "init",
			notes = "Reads the configuration file.")
	public Response init(String body) {
		// if (initialized) {
		// return Response.status(Response.Status.CONFLICT).build();
		// } else {
		config = new BotConfiguration();
		String returnString = "";
		JSONParser p = new JSONParser(JSONParser.MODE_PERMISSIVE);
		try {
			JSONObject nodes = (JSONObject) ((JSONObject) p.parse(body)).get("nodes");
			JSONObject edges = (JSONObject) ((JSONObject) p.parse(body)).get("edges");
			HashMap<String, ServiceFunction> bsfList = new HashMap<String, ServiceFunction>();
			HashMap<String, ServiceFunction> usfList = new HashMap<String, ServiceFunction>();
			HashMap<String, ServiceFunctionAttribute> sfaList = config.getServiceFunctionsAttributes();

			for (HashMap.Entry<String, Object> entry : nodes.entrySet()) {
				JSONObject elem = (JSONObject) entry.getValue();
				String nodeType = (String) elem.get("type");
				if (nodeType.equals("VLE Instance")) {
					setVLEInstance(elem);
				} else if (nodeType.equals("Bot")) {
					addBot(elem);
				} else if (nodeType.equals("Bot Action")) {
					ServiceFunction sf = addAction(entry.getKey(), elem);
					bsfList.put(entry.getKey(), sf);
					returnString += sf.getFunctionName() + "\n";
				} else if (nodeType.equals("User Action")) {
					ServiceFunction sf = addAction(entry.getKey(), elem);
					usfList.put(entry.getKey(), sf);
					returnString += sf.getFunctionName() + "\n";
				} else if (nodeType.equals("Action Parameter")) {
					ServiceFunctionAttribute sfa = addActionParameter(entry.getKey(), elem);
					sfaList.put(entry.getKey(), sfa);
					returnString += sfa.getType() + ":" + sfa.getName() + "\n";
				} else if (nodeType.equals("Action Result")) {
					ServiceFunctionAttribute sfa = new ServiceFunctionAttribute();
					sfa.setId(entry.getKey());
					sfa.setName("result");
					sfa.setType("String");
					sfaList.put(entry.getKey(), sfa);
					returnString += sfa.getType() + ":" + sfa.getName() + "\n";
				} else if (nodeType.equals("Action Body")) {
					ServiceFunctionAttribute sfa = new ServiceFunctionAttribute();
					sfa.setId(entry.getKey());
					sfa.setName("body");
					sfa.setType("JSON");
					sfaList.put(entry.getKey(), sfa);
					returnString += sfa.getType() + ":" + sfa.getName() + "\n";
				} else if (nodeType.equals("If")) {
					IfBlock ib = addIfBlock(entry.getKey(), elem);
					config.addAttributeIf(entry.getKey(), ib);
				} else if (nodeType.equals("Then")) {
					ThenBlock tb = addThenBlock(entry.getKey(), elem);
					config.addAttributeThen(entry.getKey(), tb);
				} else if (nodeType.equals("TextToText") || nodeType.equals("Classifier")) {
					ContentGenerator g = new ContentGenerator();
					g.setId(entry.getKey());
					g.setName(nodeType);
					if (nodeType.equals("TextToText")) {
						g.setServiceName(textToTextName);
					} else if (nodeType.equals("Classifier")) {
						g.setServiceName(classifierName);
					}
					config.addGenerator(entry.getKey(), g);
				}
			}
			for (HashMap.Entry<String, Object> entry : edges.entrySet()) {
				JSONObject elem = (JSONObject) entry.getValue();
				String type = (String) elem.get("type");
				String source = (String) elem.get("source");
				String target = (String) elem.get("target");
				if (type.equals("Action has Parameter")) {
					ServiceFunctionAttribute to = null;

					ServiceFunctionAttribute sfaListItem = sfaList.get(target);
					if (sfaListItem != null) {
						to = sfaListItem;
					}

					ServiceFunction bsfListItem = bsfList.get(source);
					ServiceFunction usfListItem = usfList.get(source);
					sfaListItem = sfaList.get(source);

					if (bsfListItem != null) {
						bsfListItem.addAttribute(to);
						config.addBotServiceFunction(bsfListItem.getId(), bsfListItem);
					} else if (usfListItem != null) {
						usfListItem.addAttribute(to);
						config.addUserServiceFunction(usfListItem.getId(), usfListItem);
					} else if (sfaListItem != null) {
						sfaListItem.addChildAttribute(to);
					}
				} else if (type.equals("User Action triggers Bot Action")) {
					config.addTrigger(usfList.get(source).getFunctionName(), target);
				} else if (type.equals("Same Action Paramater as")) {
					sfaList.get(source).setSameAsTrigger(true);
					sfaList.get(source).setMappedTo(target);
					sfaList.get(target).setSameAsTrigger(true);
					sfaList.get(target).setMappedTo(source);
				} else if (type.equals("Generator has Input Parameter")) {
					sfaList.get(target).setGeneratorId(source);
					ContentGenerator g = (ContentGenerator) (config.getGeneratorList().get(source));
					g.setInput(target);
				} else if (type.equals("Generator has Ouput Parameter")) {
					sfaList.get(target).setGeneratorId(source);
					ContentGenerator g = (ContentGenerator) (config.getGeneratorList().get(source));
					g.setOutput(target);
				} else if (type.equals("if Input")) {

				} else if (type.equals("then Output")) {

				} else if (type.equals("ifThen")) {

				}
			}
			JSONArray jaf = new JSONArray();
			for (String s : config.getTriggerList().keySet()) {
				jaf.add(s);
			}

			HashMap<String, ServiceFunction> allFunctions = config.getUserServiceFunctions();
			allFunctions.putAll(config.getBotServiceFunctions());
			for (ServiceFunction s : allFunctions.values()) {

				// try to get swagger information

				if (config.getServiceInformation().get(s.getServiceName()) == null
						&& s.getFunctionType().equals("service")) {
					try {
						JSONObject j = readJsonFromUrl(
								config.getBotServiceAddr() + "/" + s.getServiceName() + "/swagger.json");
						config.addServiceInformation(s.getServiceName(), j);
					} catch (Exception e) {
						e.printStackTrace();
					}
				}
				if (config.getServiceInformation().get(s.getServiceName()) != null)
					addServiceInformation(s, config.getServiceInformation().get(s.getServiceName()));
				/*
				System.out.println(s.getType() + ":" + s.getPath());
				for (ServiceFunctionAttribute sa : s.getAttributes()) {
					System.out.println(" " + sa.getName());
					for (ServiceFunctionAttribute subsa : sa.getChildAttributes()) {
						System.out.println(" " + subsa.getName());
					}
				}
				*/
			}

			JSONObject j = new JSONObject();
			j.put("triggerFunctions", jaf);
			j.put("botId", botAgent.getIdentifier());
			Context.get().monitorEvent(MonitoringEvent.BOT_ADD_TO_MONITORING, j.toJSONString());
		} catch (ParseException | ClassCastException e) {
			System.out.println(e.getMessage());
			e.printStackTrace();
			return Response.status(Response.Status.NOT_ACCEPTABLE).build();
		}
		initialized = true;
		return Response.ok().entity(returnString).build();
		// }
	}

	@POST
	@Path("/trigger")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "REPLACE THIS WITH YOUR NOTES TO THE FUNCTION")
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	public Response trigger(String body) {
		String returnString = "";
		try {
			JSONParser p = new JSONParser(JSONParser.MODE_PERMISSIVE);
			JSONObject j = (JSONObject) p.parse(body);
			if (config == null || config.getEnvironmentSeparator() == null
					|| ((JSONObject) j.get("attributes")).get(config.getEnvironmentSeparator()) == null || botIsActive
							.get(((JSONObject) j.get("attributes")).get(config.getEnvironmentSeparator())) != true) {
				return Response.status(Status.FORBIDDEN).entity("Bot is not active").build();
			}

			String f = (String) j.get("functionName");
			String triggerUID = (String) j.get("uid");
			if (config.getTriggerList().containsKey(f)
					&& !(triggerUID.toLowerCase().equals(botAgent.getIdentifier().toLowerCase()))) {

				System.out.println("Bot triggered:");

				String[] triggerFunctionKeys = ((HashSet<String>) config.getTriggerList().get(f))
						.toArray((new String[config.getTriggerList().get(f).size()]));
				String randomTriggerFunctionKey = triggerFunctionKeys[(int) (Math.random()
						* triggerFunctionKeys.length)];

				ServiceFunction sf = config.getBotServiceFunctions().get(randomTriggerFunctionKey);

				MiniClient client = new MiniClient();
				client.setConnectorEndpoint(config.getBotServiceAddr());
				client.setLogin(botAgent.getLoginName(), botPass);
				HashMap<String, String> headers = new HashMap<String, String>();
				String adjustedPath = "";
				if (sf.getFunctionType().equals("service"))
					adjustedPath = sf.getPath();
				JSONObject b = new JSONObject();
				HashMap<String, ServiceFunctionAttribute> attlist = config.getServiceFunctionsAttributes();
				for (ServiceFunctionAttribute sfa : sf.getAttributes()) {
					System.out.println(sfa.getName());
					if (sfa.isSameAsTrigger()) {
						String mappedTo = sfa.getMappedTo();
						ServiceFunctionAttribute sfam = attlist.get(mappedTo);
						JSONObject triggerAttributes = (JSONObject) j.get("attributes");
						adjustedPath = adjustedPath.replace("{" + sfa.getName() + "}",
								triggerAttributes.getAsString(sfam.getName()));
					} else if (sfa.getName() == "body") {
						JSONObject triggerAttributes = (JSONObject) j.get("attributes");
						JSONObject triggerBody = (JSONObject) triggerAttributes.get("body");
						for (ServiceFunctionAttribute subsfa : sfa.getChildAttributes()) {
							System.out.println("\t" + subsfa.getName());

							if (subsfa.isSameAsTrigger()) {
								String mappedTo = sfa.getMappedTo();
								ServiceFunctionAttribute sfam = attlist.get(mappedTo);
								b.put(subsfa.getName(), triggerBody.get(sfam.getName()));
							} else {
								// Use AI to generate body
								ContentGenerator g = config.getGeneratorList().get(subsfa.getGeneratorId());
								if (g != null) {
									String inputId = g.getInput();
									String inferInput = (String) triggerBody.get(attlist.get(inputId).getName());
									Serializable rmiResult = Context.get().invoke(g.getServiceName(), "inference",
											inferInput);
									if (rmiResult instanceof String) {
										b.put(subsfa.getName(), (String) rmiResult);
									} else {
										throw new InternalServiceException("Unexpected result ("
												+ rmiResult.getClass().getCanonicalName() + ") of RMI call");
									}
								} else {
									// condition block
								}

							}

						}
					} else {
						// TODO Pathparam -> ai or if then
					}
				}
				if (sf.getFunctionType().equals("service")) {
					ClientResponse result = client.sendRequest(sf.getType().toUpperCase(),
							sf.getServiceName() + adjustedPath, b.toJSONString(), sf.getConsumes(), sf.getProduces(),
							headers);
					returnString = result.getResponse();

				} else if (sf.getFunctionType().equals("conversation")) {
					if (sf.getConversationType().equals("Slack")) {
						String mail = ((UserAgentImpl) Context.get().fetchAgent(triggerUID)).getEmail();
						b.put("email", mail);
						b.put("token", sf.getToken());
						System.out.println(b.toJSONString());
						triggerSlack(b.toJSONString());
					}
				}
			} else {
				returnString = "Not a trigger function";
			}
			// System.out.println("Result of 'testGet': " + result.getResponse().trim());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return Response.ok().entity(returnString).build();
	}

	private String getDataString(HashMap<String, String> params) throws UnsupportedEncodingException {
		StringBuilder result = new StringBuilder();
		boolean first = true;
		for (Map.Entry<String, String> entry : params.entrySet()) {
			if (first)
				first = false;
			else
				result.append("&");
			result.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
			result.append("=");
			result.append(URLEncoder.encode(entry.getValue(), "UTF-8"));
		}
		return result.toString();
	}

	@POST
	@Path("/trigger/slack")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "REPLACE THIS WITH YOUR NOTES TO THE FUNCTION")
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	public void triggerSlack(String body) {

		HashMap<String, String> params = new HashMap<String, String>();
		Map<String, String> header = new HashMap<String, String>();
		MiniClient client = new MiniClient();
		client.setConnectorEndpoint("https://slack.com/api/");
		client.setLogin(botAgent.getLoginName(), botPass);
		String channel = "";
		ClientResponse r = null;
		Envelope userEnv = null;
		String triggerMessage = "";
		boolean found = false;
		try {
			JSONParser p = new JSONParser(JSONParser.MODE_PERMISSIVE);
			try {
				userEnv = Context.get().requestEnvelope(ENVELOPE_USER + "_" + "agendId");
				Serializable s = userEnv.getContent();
				if (s instanceof String && s != null) {
					channel = (String) s;
				} else {
					System.out.println("Wrong content");
					if (s == null)
						found = true;
					throw new EnvelopeOperationFailedException("");
				}
			} catch (EnvelopeNotFoundException | EnvelopeOperationFailedException e) {

				JSONObject b = (JSONObject) p.parse(body);
				String token = b.getAsString("token");
				params.put("token", token);
				r = client.sendRequest("POST", "users.list", getDataString(params), "application/x-www-form-urlencoded",
						"application/x-www-form-urlencoded", header);
				JSONObject j = (JSONObject) p.parse(r.getResponse());
				JSONArray memberList = (JSONArray) j.get("members");
				JSONObject foundUser = new JSONObject();

				String triggerMail = b.getAsString("email");
				for (Object o : memberList) {
					if (o instanceof JSONObject) {
						JSONObject jo = (JSONObject) o;
						JSONObject profile = (JSONObject) jo.get("profile");
						if (profile.get("email") != null) {
							String pmail = (String) profile.get("email");
							if (pmail.equals(triggerMail)) {
								foundUser = jo;
								break;
							}
						}
					}
				}
				String uId = (String) foundUser.get("id");
				r = client.sendRequest("POST", "im.list", getDataString(params), "application/x-www-form-urlencoded",
						"application/x-www-form-urlencoded", header);

				j = (JSONObject) p.parse(r.getResponse());
				JSONArray imList = (JSONArray) j.get("ims");
				JSONObject foundChannel = new JSONObject();
				for (Object o : imList) {
					if (o instanceof JSONObject) {
						JSONObject channels = (JSONObject) o;
						if (channels.get("user") != null) {
							String u = (String) channels.get("user");
							if (u.equals(uId)) {
								foundChannel = channels;
								break;
							}
						}
					}
				}
				channel = foundChannel.getAsString("id");
				if (found) {
					try {
						userEnv = Context.get().requestEnvelope(ENVELOPE_USER + "_" + "agendId");
					} catch (EnvelopeNotFoundException e1) {
						// TODO Auto-generated catch block
						e1.printStackTrace();
					}
				} else {
					userEnv = Context.get().createEnvelope(ENVELOPE_USER + "_" + "agendId",
							Context.get().getServiceAgent());
					// update envelope content
					userEnv.setPublic();
				}
				userEnv.setContent(channel);
				// store envelope with file content
				Context.get().storeEnvelope(userEnv, Context.get().getServiceAgent());
			}
			JSONObject b = (JSONObject) p.parse(body);
			triggerMessage = b.getAsString("message");
			String token = b.getAsString("token");
			params.put("channel", channel);
			params.put("token", token);
			params.put("text", triggerMessage);
			r = client.sendRequest("POST", "chat.postMessage", getDataString(params),
					"application/x-www-form-urlencoded", "application/x-www-form-urlencoded", header);

		} catch (UnsupportedEncodingException | ParseException | EnvelopeAccessDeniedException
				| EnvelopeOperationFailedException e) {
			// TODO Auto-generated catch block
			System.out.println(e.getMessage());
			e.printStackTrace();
		}
	}

	/**
	 * Template of a post function.
	 * 
	 * @param myInput The post input the user will provide.
	 * @return Returns an HTTP response with plain text string content derived from the path input param.
	 */
	@POST
	@Path("/join")
	@Produces(MediaType.TEXT_PLAIN)
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "Example method that returns a phrase containing the received input.")
	public Response join(String body) {
		String returnString = "";
		try {
			body = body.replace("$botId", botAgent.getIdentifier());
			JSONParser p = new JSONParser(JSONParser.MODE_PERMISSIVE);
			JSONObject j = (JSONObject) p.parse(body);
			System.out.println(j.getAsString(config.getEnvironmentSeparator()));
			botIsActive.put(j.getAsString(config.getEnvironmentSeparator()), true);

			String joinPath = (String) j.get("joinPath");
			String basePath = (String) j.get("basePath");

			joinPath.replace("$botId", botAgent.getIdentifier());

			MiniClient client = new MiniClient();
			client.setConnectorEndpoint(basePath);
			client.setLogin(botAgent.getLoginName(), botPass);

			j.remove("joinPath");
			j.remove("basePath");

			System.out.println(botAgent.getIdentifier());

			ClientResponse result = client.sendRequest("POST", joinPath, j.toJSONString(), "application/json",
					"text/html", new HashMap<String, String>());
		} catch (ParseException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return Response.ok().entity(returnString).build();
	}

	/**
	 * Template of a post function.
	 * 
	 * @param myInput The post input the user will provide.
	 * @return Returns an HTTP response with plain text string content derived from the path input param.
	 */
	@POST
	@Path("/models/{name}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_PLAIN)
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "Example method that returns a phrase containing the received input.")
	public Response putModel(@PathParam("name") String name, String body) {
		// fetch or create envelope by file identifier

		boolean created = false;
		Envelope fileEnv = null;
		JSONObject models = new JSONObject();
		try {
			try {
				fileEnv = Context.get().requestEnvelope(ENVELOPE_MODEL);
				Serializable s = fileEnv.getContent();
				if (s instanceof JSONObject) {
					models = (JSONObject) s;
				} else {
					System.out.println("Wrong content");
				}
			} catch (EnvelopeNotFoundException e) {
				// logger.info("File (" + ENVELOPE_MODEL + ") not found. Creating new one. " + e.toString());
				fileEnv = Context.get().createEnvelope(ENVELOPE_MODEL, Context.get().getServiceAgent());
				created = true;
			}
			// update envelope content
			fileEnv.setPublic();
			models.put(name, body);
			fileEnv.setContent(models);
			// store envelope with file content
			Context.get().storeEnvelope(fileEnv, Context.get().getServiceAgent());
		} catch (EnvelopeAccessDeniedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (EnvelopeOperationFailedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return Response.ok().entity("Model added.").build();
	}

	@GET
	@Path("/models")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "Example method that returns a phrase containing the received input.")
	public Response getModels() {
		// fetch or create envelope by file identifier

		boolean created = false;
		Envelope fileEnv = null;
		JSONObject models = new JSONObject();
		try {
			try {
				fileEnv = Context.get().requestEnvelope(ENVELOPE_MODEL);
				Serializable s = fileEnv.getContent();
				if (s instanceof JSONObject) {
					models = (JSONObject) s;
				} else {
					System.out.println("Wrong content");
				}
			} catch (EnvelopeNotFoundException e) {
				// logger.info("File (" + ENVELOPE_MODEL + ") not found. Creating new one. " + e.toString());
				fileEnv = Context.get().createEnvelope(ENVELOPE_MODEL, Context.get().getServiceAgent());
				created = true;
				// update envelope content
				fileEnv.setPublic();
				fileEnv.setContent(models);
				// store envelope with file content
				Context.get().storeEnvelope(fileEnv, Context.get().getServiceAgent());
			}
		} catch (EnvelopeAccessDeniedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (EnvelopeOperationFailedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return Response.ok().entity(models.keySet()).build();
	}

	@GET
	@Path("/models/{name}")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "Example method that returns a phrase containing the received input.")
	public Response getModelByName(@PathParam("name") String name) {
		// fetch or create envelope by file identifier
		Envelope fileEnv = null;
		JSONObject models = new JSONObject();
		try {
			try {
				fileEnv = Context.get().requestEnvelope(ENVELOPE_MODEL);
				Serializable s = fileEnv.getContent();
				if (s instanceof JSONObject) {
					models = (JSONObject) s;
				} else {
					System.out.println("Wrong content");
				}
			} catch (EnvelopeNotFoundException e) {
				// logger.info("File (" + ENVELOPE_MODEL + ") not found. Creating new one. " + e.toString());
				fileEnv = Context.get().createEnvelope(ENVELOPE_MODEL, Context.get().getServiceAgent());
				// update envelope content
				fileEnv.setPublic();
				fileEnv.setContent(models);
				// store envelope with file content
				Context.get().storeEnvelope(fileEnv, Context.get().getServiceAgent());
			}
		} catch (EnvelopeAccessDeniedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (EnvelopeOperationFailedException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return Response.ok().entity(models.get(name)).build();
	}

	@GET
	@Path("/contentGenerators")
	@Produces(MediaType.APPLICATION_JSON)
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "Example method that returns a phrase containing the received input.")
	public Response getContentGenerators() {
		return Response.ok().entity(config.getGeneratorList()).build();
	}

	// TODO your own service methods, e. g. for RMI
	private void setVLEInstance(JSONObject elem) {
		for (HashMap.Entry<String, Object> subEntry : ((JSONObject) elem.get("attributes")).entrySet()) {
			if (subEntry.getValue() instanceof JSONObject) {
				JSONObject subElem = (JSONObject) subEntry.getValue();
				JSONObject subVal = (JSONObject) subElem.get("value");
				if (subVal.get("name").equals("Addr")) {
					config.setBotServiceAddr((String) subVal.get("value"));
				} else if (subVal.get("name").equals("Environment Separator")) {
					config.setEnvironmentSeparator((String) subVal.get("value"));
					System.out.println(config.getEnvironmentSeparator());
				}
			}
		}
	}

	private ServiceFunction addAction(String key, JSONObject elem) {

		ServiceFunction sf = new ServiceFunction();
		sf.setId(key);
		String actionType = "";
		String conversationType = "";
		String service = "";
		String sfName = "";
		String token = "";
		for (HashMap.Entry<String, Object> subEntry : ((JSONObject) elem.get("attributes")).entrySet()) {
			if (subEntry.getValue() instanceof JSONObject) {
				JSONObject subElem = (JSONObject) subEntry.getValue();
				JSONObject subVal = (JSONObject) subElem.get("value");
				if (subVal.get("name").equals("Name")) {
					sfName = (String) subVal.get("value");
				} else if (subVal.get("name").equals("Service")) {
					service = (String) subVal.get("value");
				} else if (subVal.get("name").equals("Action Type")) {
					actionType = (String) subVal.get("value");
				} else if (subVal.get("name").equals("Conversation Type")) {
					conversationType = (String) subVal.get("value");
				} else if (subVal.get("name").equals("Token")) {
					token = (String) subVal.get("value");
				}
			}
		}

		if (actionType.equals("conversation")) {
			sf.setFunctionType(actionType);
			sf.setConversationType(conversationType);
			sf.setToken(token);
		} else {
			// default case
			sf.setFunctionName(sfName);
			sf.setServiceName(service);
		}
		return sf;
	}

	private ServiceFunctionAttribute addActionParameter(String key, JSONObject elem) {

		ServiceFunctionAttribute sfa = new ServiceFunctionAttribute();
		sfa.setId(key);

		for (HashMap.Entry<String, Object> subEntry : ((JSONObject) elem.get("attributes")).entrySet()) {
			if (subEntry.getValue() instanceof JSONObject) {
				JSONObject subElem = (JSONObject) subEntry.getValue();
				JSONObject subVal = (JSONObject) subElem.get("value");
				if (subVal.get("name").equals("type")) {
					sfa.setType((String) subVal.get("value"));
				} else if (subVal.get("name").equals("name")) {
					sfa.setName((String) subVal.get("value"));
				}
			}
		}
		return sfa;
	}

	private void addServiceInformation(ServiceFunction f, JSONObject elem) {
		// pfade
		for (HashMap.Entry<String, Object> subEntry : ((JSONObject) elem.get("paths")).entrySet()) {
			// type
			for (HashMap.Entry<String, Object> subsubEntry : ((JSONObject) subEntry.getValue()).entrySet()) {
				JSONObject functionInfo = (JSONObject) subsubEntry.getValue();
				String opId = (String) functionInfo.get("operationId");
				JSONArray consumes = (JSONArray) functionInfo.get("consumes");
				JSONArray produces = (JSONArray) functionInfo.get("produces");
				if (opId.toLowerCase().equals(f.getFunctionName().toLowerCase())) {
					f.setPath(subEntry.getKey());
					f.setType(subsubEntry.getKey());
					if (consumes == null) {
						f.setConsumes("text/html");
					} else {
						f.setConsumes(consumes.get(0).toString());
					}
					if (produces == null) {
						f.setProduces("text/html");
					} else {
						f.setProduces(produces.get(0).toString());
					}
				}
			}
		}
	}

	private void addBot(JSONObject elem) {
		for (HashMap.Entry<String, Object> subEntry : ((JSONObject) elem.get("attributes")).entrySet()) {
			if (subEntry.getValue() instanceof JSONObject) {
				JSONObject subElem = (JSONObject) subEntry.getValue();
				JSONObject subVal = (JSONObject) subElem.get("value");
				if (subVal.get("name").equals("Name")) {
					try {
						String botName = (String) subVal.get("value");
						botAgent = BotAgent.createBotAgent(botPass);
						botAgent.unlock(botPass);
						botAgent.setLoginName(botName);
						Context.getCurrent().storeAgent(botAgent);
						botAgent = (BotAgent) Context.getCurrent()
								.fetchAgent(Context.getCurrent().getUserAgentIdentifierByLoginName(botName));
						botAgent.unlock(botPass);
						Context.getCurrent().registerReceiver(botAgent);
						runningAt = botAgent.getRunningAtNode();
						System.out.println("Bot registered at: " + botAgent.getRunningAtNode().getNodeId());
					} catch (Exception e1) {
						e1.printStackTrace();
					}
					config.addBot(botAgent.getIdentifier(), botAgent.getLoginName());
				}
			}
		}
	}

	private IfBlock addIfBlock(String key, JSONObject elem) {
		IfBlock ib = new IfBlock();
		for (HashMap.Entry<String, Object> subEntry : ((JSONObject) elem.get("attributes")).entrySet()) {
			if (subEntry.getValue() instanceof JSONObject) {
				JSONObject subElem = (JSONObject) subEntry.getValue();
				JSONObject subVal = (JSONObject) subElem.get("value");
				if (subVal.get("name").equals("Condition Type")) {
					ib.setConditionType((String) subVal.get("value"));
				} else if (subVal.get("name").equals("value")) {
					ib.setValue((String) subVal.get("value"));
				}
			}
		}
		return ib;
	}

	private ThenBlock addThenBlock(String key, JSONObject elem) {
		ThenBlock ib = new ThenBlock();
		for (HashMap.Entry<String, Object> subEntry : ((JSONObject) elem.get("attributes")).entrySet()) {
			if (subEntry.getValue() instanceof JSONObject) {
				JSONObject subElem = (JSONObject) subEntry.getValue();
				JSONObject subVal = (JSONObject) subElem.get("value");
				if (subVal.get("name").equals("Manipulation Type")) {
					ib.setManipulationType((String) subVal.get("value"));
				} else if (subVal.get("name").equals("value")) {
					ib.setValue((String) subVal.get("value"));
				}
			}
		}
		return ib;
	}

	public boolean getMessages(ArrayList<BotMessage> messages) {
		System.out.println("Bot: Got " + messages.size() + " bot messages!");
		for (BotMessage m : messages) {
			trigger(m.getRemarks());
		}
		return true;
	}

	private static String readAll(Reader rd) throws IOException {
		StringBuilder sb = new StringBuilder();
		int cp;
		while ((cp = rd.read()) != -1) {
			sb.append((char) cp);
		}
		return sb.toString();
	}

	private static JSONObject readJsonFromUrl(String url) throws IOException, ParseException {
		InputStream is = new URL(url).openStream();
		try {
			BufferedReader rd = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
			String jsonText = readAll(rd);
			JSONParser p = new JSONParser(JSONParser.MODE_PERMISSIVE);
			JSONObject json = (JSONObject) p.parse(jsonText);
			return json;
		} finally {
			is.close();
		}
	}
}
