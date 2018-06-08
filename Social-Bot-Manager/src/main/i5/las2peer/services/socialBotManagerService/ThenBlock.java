package i5.las2peer.services.socialBotManagerService;

public class ThenBlock {
	private String manipulationType;
	private String value;
	private ThenBlock next;

	public String getManipulationType() {
		return manipulationType;
	}

	public void setManipulationType(String manipulationType) {
		this.manipulationType = manipulationType;
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	public ThenBlock getNext() {
		return next;
	}

	public void setNext(ThenBlock next) {
		this.next = next;
	}

	public boolean hasNext() {
		return next != null;
	}
}
