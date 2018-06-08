package i5.las2peer.services.socialBotManagerService;

public class IfBlock {
	private String conditionType;
	private String value;
	private IfBlock next;

	public String getConditionType() {
		return conditionType;
	}

	public void setConditionType(String conditionType) {
		this.conditionType = conditionType;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public IfBlock getNext() {
		return next;
	}

	public void setNext(IfBlock next) {
		this.next = next;
	}

	public boolean hasNext() {
		return next != null;
	}
}
