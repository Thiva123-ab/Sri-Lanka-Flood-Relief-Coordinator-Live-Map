# Sri Lanka Flood Relief Coordinator and Live Map

This project is a Spring Boot application designed to coordinate flood relief efforts and provide a live map for situational awareness in Sri Lanka. It connects relief coordinators with real-time data to facilitate efficient disaster response.

## 🚀 Features

* **Flood Relief Coordination:** Management system for coordinating relief resources and requests.
* **Live Map Integration:** Real-time visualization of affected areas and relief centers.
* **RESTful API:** Backend support for web and mobile client integration.
* **Real-time Communication:** Chat and alert systems for immediate updates.

## 🛠️ Tech Stack

* **Java:** JDK 17
* **Framework:** Spring Boot (Web, Data JPA)
* **Database:** MySQL
* **Build Tool:** Maven

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
* [Java Development Kit (JDK) 17](https://www.oracle.com/java/technologies/downloads/#java17)
* [MySQL Server](https://dev.mysql.com/downloads/installer/)

## ⚙️ Configuration

1.  **Database Setup**
    Update your `application.properties` file with your database credentials:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/flood_relief_db?createDatabaseIfNotExist=true
    spring.datasource.username=root
    spring.datasource.password=your_password
    ```

2.  **Build the Project**
    ```bash
    ./mvnw clean install
    ```

3.  **Run the Application**
    ```bash
    ./mvnw spring-boot:run
    ```

## 🤝 Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.




