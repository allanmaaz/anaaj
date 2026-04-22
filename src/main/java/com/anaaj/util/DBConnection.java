package com.anaaj.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import java.io.InputStream;
import java.io.InputStreamReader;
import org.h2.tools.RunScript;

public class DBConnection {

    // Switch to embedded H2 zero-setup database
    private static final String URL = "jdbc:h2:mem:anaajdb;DB_CLOSE_DELAY=-1;MODE=MySQL;DATABASE_TO_LOWER=TRUE";
    private static final String USER = "sa";
    private static final String PASSWORD = ""; // No password required for H2 by default

    private static boolean isInitialized = false;

    static {
        try {
            Class.forName("org.h2.Driver");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static synchronized Connection getConnection() throws SQLException {
        Connection conn = DriverManager.getConnection(URL, USER, PASSWORD);
        
        if (!isInitialized) {
            try {
                InputStream is = DBConnection.class.getResourceAsStream("/anaaj_schema_h2.sql");
                if (is != null) {
                    RunScript.execute(conn, new InputStreamReader(is, "UTF-8"));
                    isInitialized = true;
                } else {
                    System.err.println("Could not find /anaaj_schema_h2.sql in classpath!");
                }
            } catch (Exception ex) {
                ex.printStackTrace();
                throw new SQLException("Failed to initialize database schema: " + ex.getMessage());
            }
        }
        
        return conn;
    }

    private DBConnection() {
    } // Utility class — no instantiation
}
