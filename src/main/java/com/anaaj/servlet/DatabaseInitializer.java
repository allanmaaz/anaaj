package com.anaaj.servlet;

import com.anaaj.util.DBConnection;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import java.sql.Connection;

/**
 * Ensures the in-memory H2 database is initialized as soon as the server starts.
 * This prevents the "Database Not Found" error in the H2 Console.
 */
@WebListener
public class DatabaseInitializer implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            // Force a connection to create the DB and run the schema script
            try (Connection conn = DBConnection.getConnection()) {
                System.out.println("✅ Anaaj Database initialized successfully at startup.");
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to initialize Anaaj Database at startup: " + e.getMessage());
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        // Nothing to do here
    }
}
