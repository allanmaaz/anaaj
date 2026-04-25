package com.anaaj.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import java.io.InputStream;
import java.io.InputStreamReader;
import org.h2.tools.RunScript;

/**
 * Smart DB connection that uses PostgreSQL on Render (via DATABASE_URL env var)
 * and falls back to H2 in-memory for local development.
 */
public class DBConnection {

    // H2 fallback for local dev
    private static final String H2_URL = "jdbc:h2:mem:anaajdb;DB_CLOSE_DELAY=-1;MODE=MySQL;DATABASE_TO_LOWER=TRUE";
    private static final String H2_USER = "sa";
    private static final String H2_PASSWORD = "";

    private static boolean isInitialized = false;
    private static boolean usePostgres = false;

    // PostgreSQL connection info (parsed from DATABASE_URL)
    private static String pgUrl;
    private static String pgUser;
    private static String pgPassword;

    static {
        try {
            // Try to load PostgreSQL driver
            Class.forName("org.postgresql.Driver");
        } catch (Exception e) { /* not available */ }
        try {
            Class.forName("org.h2.Driver");
        } catch (Exception e) { /* not available */ }

        // Check for Render's DATABASE_URL environment variable
        String databaseUrl = System.getenv("DATABASE_URL");
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            try {
                // Render provides: postgres://user:password@host:port/dbname
                // JDBC needs:       jdbc:postgresql://host:port/dbname
                if (databaseUrl.startsWith("postgres://")) {
                    databaseUrl = databaseUrl.replace("postgres://", "");
                }
                if (databaseUrl.startsWith("postgresql://")) {
                    databaseUrl = databaseUrl.replace("postgresql://", "");
                }

                String userInfo = databaseUrl.substring(0, databaseUrl.indexOf('@'));
                String hostAndDb = databaseUrl.substring(databaseUrl.indexOf('@') + 1);

                pgUser = userInfo.split(":")[0];
                pgPassword = userInfo.split(":")[1];
                pgUrl = "jdbc:postgresql://" + hostAndDb + "?sslmode=require";

                usePostgres = true;
                System.out.println("✅ PostgreSQL configured: " + pgUrl);
            } catch (Exception e) {
                System.err.println("⚠️ Failed to parse DATABASE_URL, falling back to H2: " + e.getMessage());
                usePostgres = false;
            }
        } else {
            System.out.println("ℹ️ No DATABASE_URL found, using H2 in-memory database (local dev mode)");
        }
    }

    public static synchronized Connection getConnection() throws SQLException {
        if (usePostgres) {
            Connection conn = DriverManager.getConnection(pgUrl, pgUser, pgPassword);
            if (!isInitialized) {
                initPostgresSchema(conn);
                isInitialized = true;
            }
            return conn;
        } else {
            Connection conn = DriverManager.getConnection(H2_URL, H2_USER, H2_PASSWORD);
            if (!isInitialized) {
                initH2Schema(conn);
                isInitialized = true;
            }
            return conn;
        }
    }

    private static void initH2Schema(Connection conn) {
        try {
            InputStream is = DBConnection.class.getResourceAsStream("/anaaj_schema_h2.sql");
            if (is != null) {
                RunScript.execute(conn, new InputStreamReader(is, "UTF-8"));
                System.out.println("✅ H2 schema initialized");
            } else {
                System.err.println("Could not find /anaaj_schema_h2.sql in classpath!");
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private static void initPostgresSchema(Connection conn) {
        try {
            InputStream is = DBConnection.class.getResourceAsStream("/anaaj_schema_postgres.sql");
            if (is != null) {
                String sql = new String(is.readAllBytes(), "UTF-8");
                conn.createStatement().execute(sql);
                System.out.println("✅ PostgreSQL schema initialized");
            } else {
                System.err.println("Could not find /anaaj_schema_postgres.sql in classpath!");
            }
        } catch (Exception ex) {
            // Schema may already exist — that's fine for PostgreSQL
            System.out.println("ℹ️ PostgreSQL schema init: " + ex.getMessage());
        }
    }

    private DBConnection() {} // Utility class — no instantiation
}
