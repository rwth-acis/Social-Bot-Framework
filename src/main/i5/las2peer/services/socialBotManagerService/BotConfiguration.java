package i5.las2peer.services.socialBotManagerService;

import java.util.HashMap;
import java.util.HashSet;

import net.minidev.json.JSONObject;

public class BotConfiguration {

	private String botServiceAddr = "";
	private String environmentSeparator = "";
	private HashMap<String, String> bots;
	private HashMap<String, ServiceFunction> botServiceFunctions;
	private HashMap<String, ServiceFunction> userServiceFunctions;
	private HashMap<String, JSONObject> serviceInformation;
	private HashMap<String, HashSet<String>> triggerList;
	private HashMap<String, ContentGenerator> generatorList;
	private HashMap<String, ServiceFunctionAttribute> serviceFunctionsAttributes;
	private HashMap<String, IfBlock> attributeIfs;
	private HashMap<String, ThenBlock> attributeThens;

	public BotConfiguration() {
		setBots(new HashMap<String, String>());
		botServiceFunctions = new HashMap<String, ServiceFunction>();
		userServiceFunctions = new HashMap<String, ServiceFunction>();
		serviceInformation = new HashMap<String, JSONObject>();
		triggerList = new HashMap<String, HashSet<String>>();
		serviceFunctionsAttributes = new HashMap<String, ServiceFunctionAttribute>();
		generatorList = new HashMap<String, ContentGenerator>();
		attributeIfs = new HashMap<String, IfBlock>();
		attributeThens = new HashMap<String, ThenBlock>();
	}

	public String getBotServiceAddr() {
		return botServiceAddr;
	}

	public void setBotServiceAddr(String botServiceAddr) {
		this.botServiceAddr = botServiceAddr;
	}

	public HashMap<String, ServiceFunction> getBotServiceFunctions() {
		return botServiceFunctions;
	}

	public void setServiceFunctions(HashMap<String, ServiceFunction> serviceFunctions) {
		this.botServiceFunctions = serviceFunctions;
	}

	public void addBotServiceFunction(String name, ServiceFunction serviceFunction) {
		this.botServiceFunctions.put(name, serviceFunction);
	}

	public HashMap<String, ServiceFunctionAttribute> getServiceFunctionsAttributes() {
		return serviceFunctionsAttributes;
	}

	public void setServiceFunctionsAttributes(HashMap<String, ServiceFunctionAttribute> serviceFunctionsAttributes) {
		this.serviceFunctionsAttributes = serviceFunctionsAttributes;
	}

	public void addServiceFunctionsAttributes(String key, ServiceFunctionAttribute serviceFunctionsAttribute) {
		this.serviceFunctionsAttributes.put(key, serviceFunctionsAttribute);
	}

	public HashMap<String, ServiceFunction> getUserServiceFunctions() {
		return userServiceFunctions;
	}

	public void setUserServiceFunctions(HashMap<String, ServiceFunction> userServiceFunctions) {
		this.userServiceFunctions = userServiceFunctions;
	}

	public void addUserServiceFunction(String name, ServiceFunction serviceFunction) {
		this.userServiceFunctions.put(name, serviceFunction);
	}

	public HashMap<String, JSONObject> getServiceInformation() {
		return serviceInformation;
	}

	public void setServiceInformation(HashMap<String, JSONObject> serviceInformation) {
		this.serviceInformation = serviceInformation;
	}

	public void addServiceInformation(String name, JSONObject info) {
		this.serviceInformation.put(name, info);
	}

	public HashMap<String, HashSet<String>> getTriggerList() {
		return triggerList;
	}

	public void setTriggerList(HashMap<String, HashSet<String>> triggerList) {
		this.triggerList = triggerList;
	}

	public void addTrigger(String t, String f) {
		HashSet<String> l = this.triggerList.get(t);
		if (l == null) {
			l = new HashSet<String>();
			l.add(f);
			this.triggerList.put(t, l);
		} else {
			l.add(f);
		}
	}

	public HashMap<String, ContentGenerator> getGeneratorList() {
		return generatorList;
	}

	public void setGeneratorList(HashMap<String, ContentGenerator> generatorList) {
		this.generatorList = generatorList;
	}

	public void addGenerator(String s, ContentGenerator g) {
		this.generatorList.put(s, g);
	}

	public HashMap<String, String> getBots() {
		return bots;
	}

	public void setBots(HashMap<String, String> bots) {
		this.bots = bots;
	}

	public void addBot(String id, String name) {
		this.bots.put(id, name);
	}

	public String getEnvironmentSeparator() {
		return environmentSeparator;
	}

	public void setEnvironmentSeparator(String environmentSeparator) {
		this.environmentSeparator = environmentSeparator;
	}

	public HashMap<String, IfBlock> getAttributeIfs() {
		return attributeIfs;
	}

	public void setAttributeIfs(HashMap<String, IfBlock> attributeIfs) {
		this.attributeIfs = attributeIfs;
	}

	public void addAttributeIf(String key, IfBlock ib) {
		this.attributeIfs.put(key, ib);
	}

	public HashMap<String, ThenBlock> getAttributeThens() {
		return attributeThens;
	}

	public void setAttributeThens(HashMap<String, ThenBlock> attributeThens) {
		this.attributeThens = attributeThens;
	}

	public void addAttributeThen(String key, ThenBlock tb) {
		this.attributeThens.put(key, tb);
	}
}
