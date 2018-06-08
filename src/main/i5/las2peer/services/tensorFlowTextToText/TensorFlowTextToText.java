package i5.las2peer.services.tensorFlowTextToText;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.OpenOption;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.Scanner;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import i5.las2peer.api.ManualDeployment;
import i5.las2peer.logging.bot.BotContentGenerator;
import i5.las2peer.logging.bot.BotStatus;
import i5.las2peer.restMapper.RESTService;
import i5.las2peer.restMapper.annotations.ServicePath;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import io.swagger.annotations.Contact;
import io.swagger.annotations.Info;
import io.swagger.annotations.License;
import io.swagger.annotations.SwaggerDefinition;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;
import net.minidev.json.parser.ParseException;

/**
 * las2peer-TensorFlow-Classifier
 * 
 * This is a template for a very basic las2peer service that uses the las2peer WebConnector for RESTful access to it.
 * 
 * Note: If you plan on using Swagger you should adapt the information below in the SwaggerDefinition annotation to suit
 * your project. If you do not intend to provide a Swagger documentation of your service API, the entire Api and
 * SwaggerDefinition annotation should be removed.
 * 
 */

@Api
@SwaggerDefinition(
		info = @Info(
				title = "las2peer TensorFlow Text to Text",
				version = "1.0",
				description = "A las2peer TensorFlow service for text generation.",
				termsOfService = "http://your-terms-of-service-url.com",
				contact = @Contact(
						name = "Alexander Tobias Neumann",
						url = "provider.com",
						email = "john.doe@provider.com"),
				license = @License(
						name = "your software license name",
						url = "http://your-software-license-url.com")))
@ServicePath("/texttotext")
@ManualDeployment
public class TensorFlowTextToText extends RESTService implements BotContentGenerator {
	String pythonScriptPath;
	private static HashMap<String, BotStatus> botStatus = new HashMap<String, BotStatus>();
	private static HashMap<String, String> botLog = new HashMap<String, String>();
	private static HashMap<String, Thread> trainThread = new HashMap<String, Thread>();
	private static HashMap<String, Process> trainProcess = new HashMap<String, Process>();

	public TensorFlowTextToText() {
		super();
		setFieldValues();
	}

	@Override
	public boolean trainStep(String input, String output) {
		try {
			ProcessBuilder builder = new ProcessBuilder("python", pythonScriptPath + "\\train.py", input, output);
			builder.directory(new File(pythonScriptPath).getAbsoluteFile()); // this is where you set the root folder
																				// for the executable to run with
			builder.redirectErrorStream(true);
			Process process = builder.start();

			Scanner s = new Scanner(process.getInputStream());
			StringBuilder text = new StringBuilder();
			while (s.hasNextLine()) {
				text.append(s.nextLine());
				text.append("\n");
			}
			s.close();

			int result = process.waitFor();

			System.out.printf("Process exited with result %d and output %s%n", result, text);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		} catch (Exception e) {
			System.out.printf("Error");
			return false;
		}
		return true;
	}

	@POST
	@Path("/train")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_HTML)
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "REPLACE THIS WITH YOUR NOTES TO THE FUNCTION")
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	public Response trainREST(String content) {
		boolean text = false;
		String out_dir = "";
		try {
			JSONParser parser = new JSONParser(JSONParser.MODE_PERMISSIVE);
			JSONObject params = (JSONObject) parser.parse(content);
			out_dir = (String) params.get("out_dir");
			if (botStatus.get(out_dir) == null) {
				botStatus.put(out_dir, BotStatus.DISABLED);
			}
			if (botStatus.get(out_dir) == BotStatus.READY || botStatus.get(out_dir) == BotStatus.DISABLED) {
				botLog.put(out_dir, "Training start!\n");
				botStatus.put(out_dir, BotStatus.TRAINING);

				double learning_rate = (double) params.get("learning_rate");
				int num_training_steps = (int) params.get("num_train_steps");
				// int epoch_step = num_training_steps * ((int) params.get("epoch_step"));
				text = train(out_dir, learning_rate, num_training_steps);

			} else if (botStatus.get(out_dir) == BotStatus.TRAINING) {
				return Response.status(Response.Status.CONFLICT).entity("Currently training").build();
			}
		} catch (ParseException e) {
			botStatus.put(out_dir, BotStatus.DISABLED);
			e.printStackTrace();
			System.out.println(e.getMessage());
		}
		return Response.ok().entity("").build();
	}

	@GET
	@Path("/status")
	@Produces(MediaType.TEXT_HTML)
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "REPLACE THIS WITH YOUR NOTES TO THE FUNCTION")
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	public Response getStatusREST(@QueryParam("unit") String unit) {
		BotStatus bs = botStatus.get(unit);
		return Response.ok().entity(bs.name()).build();
	}

	@GET
	@Path("/log")
	@Produces(MediaType.TEXT_HTML)
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "REPLACE THIS WITH YOUR NOTES TO THE FUNCTION")
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	public Response getTrainLogREST(@QueryParam("unit") String unit) {
		return Response.ok().entity(botLog.get(unit)).build();
	}

	@DELETE
	@Path("/train")
	@Produces(MediaType.TEXT_HTML)
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "REPLACE THIS WITH YOUR NOTES TO THE FUNCTION")
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	public Response abortTrainREST(@QueryParam("unit") String unit) {
		if (trainThread.get(unit) != null && botStatus.get(unit) == BotStatus.TRAINING) {
			trainProcess.get(unit).destroy();
			trainThread.get(unit).interrupt();
			return Response.ok().entity("Training stopped.").build();
		}
		return Response.ok().entity("Bot wasn't training.").build();
	}

	private static void copyFolder(File sourceFolder, File destinationFolder) throws IOException {
		// Check if sourceFolder is a directory or file
		// If sourceFolder is file; then copy the file directly to new location
		if (sourceFolder.isDirectory()) {
			// Verify if destinationFolder is already present; If not then create it
			if (!destinationFolder.exists()) {
				destinationFolder.mkdir();
			}

			// Get all files from source directory
			String files[] = sourceFolder.list();

			// Iterate over all files and copy them to destinationFolder one by one
			for (String file : files) {
				File srcFile = new File(sourceFolder, file);
				File destFile = new File(destinationFolder, file);

				// Recursive function call
				copyFolder(srcFile, destFile);
			}
		} else {
			// Copy the file content from one place to another
			Files.copy(sourceFolder.toPath(), destinationFolder.toPath(), StandardCopyOption.REPLACE_EXISTING);
		}
	}

	@Override
	public boolean train(String out_dir, double learning_rate, int num_training_steps) {

		StringBuilder text = new StringBuilder();
		Thread t = new Thread() {
			public void run() {
				try {
					java.nio.file.Path modelDir = Paths.get(pythonScriptPath + "/" + out_dir);
					if (!Files.exists(modelDir)) {
						copyFolder(new File(pythonScriptPath + "/base"), modelDir.toFile());
					}
					java.nio.file.Path path = Paths.get(pythonScriptPath + "/" + out_dir + "/hparams");
					java.nio.file.Path path2 = Paths.get(pythonScriptPath + "/" + out_dir + "/best_bleu/hparams");

					Charset charset = StandardCharsets.UTF_8;
					String content = new String(Files.readAllBytes(path), charset);
					JSONParser p = new JSONParser(JSONParser.MODE_PERMISSIVE);
					JSONObject j = (JSONObject) p.parse(content);

					j.put("best_bleu_dir", out_dir + "/best_bleu");
					j.put("out_dir", out_dir + "/");
					j.put("num_train_steps", num_training_steps);
					j.put("steps_per_stats", num_training_steps / 10);
					j.put("learning_rate", learning_rate);

					Gson gson = new GsonBuilder().setPrettyPrinting().create();
					String hparam = gson.toJson(j);

					Files.write(path, hparam.getBytes(charset), new OpenOption[] { StandardOpenOption.WRITE });
					Files.write(path2, j.toJSONString().getBytes(charset),
							new OpenOption[] { StandardOpenOption.WRITE });

					ProcessBuilder builder = new ProcessBuilder("python3", "train.py", "-out_dir=" + out_dir,
							"-learning_rate=" + learning_rate, "-num_train_steps=" + num_training_steps);
					builder.directory(new File(pythonScriptPath).getAbsoluteFile()); // this is where you set the root
																						// folder
																						// for the executable to run
																						// with
					builder.redirectErrorStream(true);
					trainProcess.put(out_dir, builder.start());
					Scanner s = new Scanner(trainProcess.get(out_dir).getInputStream());
					while (s.hasNextLine()) {
						String t = s.nextLine();
						System.out.println(t);
						text.append(t);
						text.append("\n");
						botLog.put(out_dir, botLog.get(out_dir) + t + "<br>");

					}
					s.close();
					trainProcess.get(out_dir).waitFor();

					botStatus.put(out_dir, BotStatus.READY);
				} catch (IOException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
					botStatus.put(out_dir, BotStatus.DISABLED);
				} catch (Exception e) {
					System.out.printf("Error");
					botStatus.put(out_dir, BotStatus.DISABLED);
				}
			}
		};
		trainThread.put(out_dir, t);
		t.start();

		return true;
	}

	@POST
	@Path("/inference")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_HTML)
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "REPLACE THIS WITH YOUR NOTES TO THE FUNCTION")
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	public Response inferenceREST(String content, @QueryParam("unit") String unit) {
		String text = "";
		if (botStatus.get(unit) != BotStatus.DISABLED) {
			botStatus.put(unit, BotStatus.BUSY);
			JSONParser parser = new JSONParser(JSONParser.MODE_PERMISSIVE);
			String input = "";
			try {
				JSONObject params = (JSONObject) parser.parse(content);
				input = (String) params.get("input");
				text = (String) inference(unit, input);
			} catch (ParseException e) {
				e.printStackTrace();
				System.out.println(e.getMessage());
			}
			botStatus.put(unit, BotStatus.READY);
		} else {
			Response.status(Status.CONFLICT).entity("Bot is not ready").build();
		}
		return Response.ok().entity(text).build();

	}

	@Override
	public Object inference(String input) {
		StringBuilder text = new StringBuilder();
		try {
			ProcessBuilder builder = new ProcessBuilder("python3", "inference.py", input);
			builder.directory(new File(pythonScriptPath).getAbsoluteFile()); // this is where you set the root folder
																				// for the executable to run with
			builder.redirectErrorStream(true);
			Process process = builder.start();
			Scanner s = new Scanner(process.getInputStream());
			while (s.hasNextLine()) {
				text.append(s.nextLine());
				text.append("\n");
			}
			s.close();

			int result = process.waitFor();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		} catch (Exception e) {
			System.out.printf("Error");
			return false;
		}
		return text.toString();
	}

	public Object inference(String model, String input) {
		StringBuilder text = new StringBuilder();
		try {
			ProcessBuilder builder = new ProcessBuilder("python3", "inference.py", input, model);
			builder.directory(new File(pythonScriptPath).getAbsoluteFile()); // this is where you set the root folder
																				// for the executable to run with
			builder.redirectErrorStream(true);
			Process process = builder.start();
			Scanner s = new Scanner(process.getInputStream());
			while (s.hasNextLine()) {
				text.append(s.nextLine());
				text.append("\n");
			}
			s.close();

			int result = process.waitFor();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return false;
		} catch (Exception e) {
			System.out.printf("Error");
			return false;
		}
		return text.toString();
	}

}
