package i5.las2peer.services.tensorFlowTest;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.tensorflow.Graph;
import org.tensorflow.SavedModelBundle;
import org.tensorflow.Session;
import org.tensorflow.Tensor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import i5.las2peer.api.ManualDeployment;
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
import net.minidev.json.parser.ParseException;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.JSONParser;


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
				title = "las2peer Template Service",
				version = "1.0",
				description = "A las2peer Template Service for demonstration purposes.",
				termsOfService = "http://your-terms-of-service-url.com",
				contact = @Contact(
						name = "John Doe",
						url = "provider.com",
						email = "john.doe@provider.com"),
				license = @License(
						name = "your software license name",
						url = "http://your-software-license-url.com")))
@ServicePath("/template")
@ManualDeployment
public class TensorFlowService extends RESTService {
	HashMap<String, Integer> dictionary;

	int[][] array = new int[1][];
	int[][] array2 = new int[1][];

	Session s = null;
	SavedModelBundle bundle = null;
	String pythonScriptPath;

	static String readFile(String path, Charset encoding) throws IOException {
		byte[] encoded = Files.readAllBytes(Paths.get(path));
		return new String(encoded, encoding);
	}

	public void load_data() {
		HashMap<String, Integer> data = new HashMap<String, Integer>();
		try {
			ObjectMapper mapper = new ObjectMapper();
			String json = readFile("model/dictionary.json", StandardCharsets.UTF_8);
			data = mapper.readValue(json, new TypeReference<Map<String, Integer>>() {
			});
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		array[0] = new int[43];
		dictionary = data;
	}

	public String cleanString(String s) {
		s = s.replaceAll("[^A-Za-z0-9(),!?\']", " ");
		s = s.replaceAll("\'s", " \'s");
		s = s.replaceAll("\'ve", " \'ve");
		s = s.replaceAll("n\'t", " n\'t");
		s = s.replaceAll("\'re", " \'re");
		s = s.replaceAll("\'d", " \'d");
		s = s.replaceAll("\'ll", " \'ll");
		s = s.replaceAll(",", " , ");
		s = s.replaceAll("!", " ! ");
		s = s.replace("?", " \\? ");
		s = s.replace("(", " \\( ");
		s = s.replace(")", " \\) ");
		return s.toLowerCase();
	}

	public int maxLenInArray(String[] arr) {
		int len = 0;
		for (int i = 0; i < arr.length; i++) {
			if (arr[i].length() > len)
				len = arr[i].length();
		}
		return len;
	}

	public TensorFlowService() {
		super();
		setFieldValues();
		if(dictionary==null)
			load_data();
		try (Graph g = new Graph()) {
			s = SavedModelBundle.load("model", "serve").session();
		}
	}

	/**
	 * Template of a get function.
	 * @param content a JSON string containing the message that should be classified
	 * @return Returns an HTTP response with plain text string content.
	 */
	@POST
	@Path("/classify")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.TEXT_HTML)
	@ApiOperation(
			value = "REPLACE THIS WITH AN APPROPRIATE FUNCTION NAME",
			notes = "REPLACE THIS WITH YOUR NOTES TO THE FUNCTION")
	@ApiResponses(
			value = { @ApiResponse(
					code = HttpURLConnection.HTTP_OK,
					message = "REPLACE THIS WITH YOUR OK MESSAGE") })
	public Response classify(String content){
		JSONParser parser = new JSONParser(JSONParser.MODE_PERMISSIVE);
		String input = "";
		try {
			JSONObject params = (JSONObject) parser.parse(content);
			input = (String) params.get("message");
		}catch(ParseException e) {
			e.printStackTrace();
			System.out.println(e.getMessage());
		}

		long[] res = new long[1];
		try {
			input = cleanString(input);
			String[] inputs = input.split(" ");
			for (int i = 0; i < inputs.length; i++) {
				try {
					array[0][i] = dictionary.get(inputs[i]);
				} catch (Exception e) {
					array[0][i] = dictionary.get("<PAD/>");
				}
			}
			for (int i = inputs.length; i < array[0].length; i++) {
				array[0][i] = dictionary.get("<PAD/>");
			}
			final Tensor<?> inputTensor = Tensor.create(array);
			final Tensor<?> inputTensor2 = Tensor.create(1.0f, Float.class);
			Tensor<?> result = s.runner().feed("input_x", inputTensor).feed("dropout_keep_prob", inputTensor2)
					.fetch("output/predictions").run().get(0);
			result.copyTo(res);
		} catch (Exception e) {
			e.printStackTrace();
			System.out.println(e.getMessage());
		}
		return Response.ok().entity(codeToString((int) res[0])).build();

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
	public Response train(String content){
		JSONParser parser = new JSONParser(JSONParser.MODE_PERMISSIVE);
		String input = "";
		String output = "";
		try {
			JSONObject params = (JSONObject) parser.parse(content);
			input = (String) params.get("input");
			output = (String) params.get("output");
		}catch(ParseException e) {
			e.printStackTrace();
			System.out.println(e.getMessage());
		}
		
		try {
			ProcessBuilder builder = new ProcessBuilder( "python",pythonScriptPath+"\\train.py",input,output);
			builder.directory( new File(pythonScriptPath).getAbsoluteFile() ); // this is where you set the root folder for the executable to run with
			builder.redirectErrorStream(true);
			Process process =  builder.start();

			Scanner s = new Scanner(process.getInputStream());
			StringBuilder text = new StringBuilder();
			while (s.hasNextLine()) {
			  text.append(s.nextLine());
			  text.append("\n");
			}
			s.close();

			int result = process.waitFor();

			System.out.printf( "Process exited with result %d and output %s%n", result, text );
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (Exception e) {
			System.out.printf( "Error");
		}
		return Response.ok().entity("Model trained").build();

	}

	public String codeToString(int code) {
		switch (code) {
		case 0:
			return "html";
		case 1:
			return "mysql";
		case 2:
			return "php";
		case 3:
			return "java";
		default:
			return "unkwown";
		}
	}

}
