package i5.las2peer.services.socialBotManagerService;

import java.util.ArrayList;

public class ServiceFunctionAttribute {
	private String id;
	private String name;
	private String type;
	private boolean sameAsTrigger = false;
	private String mappedTo;
	private ArrayList<ServiceFunctionAttribute> childAttributes;
	private String generatorId;

	public ServiceFunctionAttribute() {
		childAttributes = new ArrayList<ServiceFunctionAttribute>();
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public ArrayList<ServiceFunctionAttribute> getChildAttributes() {
		return childAttributes;
	}

	public void setChildAttributes(ArrayList<ServiceFunctionAttribute> childAttributes) {
		this.childAttributes = childAttributes;
	}

	public void addChildAttribute(ServiceFunctionAttribute childAttribute) {
		this.childAttributes.add(childAttribute);
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public boolean isSameAsTrigger() {
		return sameAsTrigger;
	}

	public void setSameAsTrigger(boolean sameAsTrigger) {
		this.sameAsTrigger = sameAsTrigger;
	}

	public String getGeneratorId() {
		return generatorId;
	}

	public void setGeneratorId(String generatorId) {
		this.generatorId = generatorId;
	}

	public String getMappedTo() {
		return mappedTo;
	}

	public void setMappedTo(String mappedTo) {
		this.mappedTo = mappedTo;
	}
}
