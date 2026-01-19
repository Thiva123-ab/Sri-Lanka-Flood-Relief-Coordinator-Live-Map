# Sri Lanka Flood Relief Coordinator and Live Map

This project is a Spring Boot application designed to coordinate flood relief efforts and provide a live map for situational awareness in Sri Lanka. It connects relief coordinators with real-time data to facilitate efficient disaster response.

## 🚀 Features

* **Flood Relief Coordination:** Management system for coordinating relief resources and requests.
* **Live Map Integration:** Real-time visualization of affected areas and relief centers.
* **RESTful API:** Backend support for web and mobile client integration.

## 🛠️ Tech Stack

* **Java:** JDK 17
* **Framework:** Spring Boot (Web, Data JPA)
* **Database:** MySQL
* **Build Tool:** Maven

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
* [Java Development Kit (JDK) 17](https://www.oracle.com/java/technologies/downloads/#java17)
* [MySQL Server](https://dev.mysql.com/downloads/installer/)
* [Maven](https://maven.apache.org/download.cgi) (Optional, as the project includes the Maven Wrapper)

## ⚙️ Configuration & Setup

1.  **Clone the repository**
    ```bash
    git clone <your-repository-url>
    cd Sri_Lanka_Flood_Relief_Coordinator_and_Live_Map
    ```

2.  **Configure the Database**
    Open `src/main/resources/application.properties` and add your MySQL database connection details. Since you are using `mysql-connector-j`, the configuration should look like this:

    ```properties
    spring.application.name=Sri Lanka_Flood_Relief_Coordinator_and_Live_Map
    
    # Database Configuration
    spring.datasource.url=jdbc:mysql://localhost:3306/flood_relief_db?createDatabaseIfNotExist=true
    spring.datasource.username=root
    spring.datasource.password=your_password
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.show-sql=true
    ```
    *Note: Make sure to create a database (e.g., `flood_relief_db`) or allow Hibernate to create it.*

3.  **Build the Project**
    Use the included Maven Wrapper to clean and install dependencies:
    * **Windows:**
        ```cmd
        mvnw.cmd clean install
        ```
    * **Mac/Linux:**
        ```bash
        ./mvnw clean install
        ```

## 🏃‍♂️ How to Run

After building the project, you can run it using the Maven Wrapper:

```bash
./mvnw spring-boot:run