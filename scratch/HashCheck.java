import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;

public class HashCheck {
    public static void main(String[] args) throws Exception {
        String plain = "GoogleAuth123!@#";
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] hash = md.digest(plain.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) sb.append(String.format("%02x", b));
        System.out.println("Password: " + plain);
        System.out.println("Hash: " + sb.toString());
    }
}
