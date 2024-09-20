import { v1 } from "@docker/extension-api-client-types";

// Declare a variable to store the container ID
let containerID: string;

export const startKrsContainer = async (ddClient: v1.DockerDesktopClient) => {
  try {
    if (!containerID) {
      // Start the container in detached mode
      const output = await ddClient.docker.cli.exec("run", [
        "-d", // Detached mode to keep the container running
        "--network",
        "host", // Add the --network host option
        "-v", // Volume flag
        `~/.kube/config:/root/.kube/config`, // Mount the local ~/.kube/config to the container's /root/.kube/config
        "dminhph/krs-extension:latest", // Docker image to run
        "sleep",
        "infinity",
      ]);
      containerID = output.stdout.trim();
      console.log("Container started with ID: ", containerID);
    }

    return containerID;
  } catch (error: any) {
    console.error("Error starting KRS container: ", error);
    return `Failed to start KRS container: ${error.message}`;
  }
};

export const initKRS = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec("exec", [
      containerID,
      "krs", // Command to run inside the container
      "init", // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log("Command executed, output received: ", output);

    if (output?.stderr) {
      console.error("Error output from krs init:", output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || "No output received";
  } catch (error: any) {
    console.error("Error executing krs command:", error);
    return `Failed to initialize krs: ${error.message}`;
  }
};

export const krsScan = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec("exec", [
      containerID,
      "krs", // Command to run inside the container
      "scan", // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log("Command executed, output received: ", output);

    if (output?.stderr) {
      console.error("Error output from krs scan:", output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || "No output received";
  } catch (error: any) {
    console.error("Error executing krs command:", error);
    return `Failed to krs scan: ${error.message}`;
  }
};

export const krsRecommend = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec("exec", [
      containerID,
      "krs", // Command to run inside the container
      "recommend", // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log("Command executed, output received: ", output);

    if (output?.stderr) {
      console.error("Error output from krs recommend:", output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || "No output received";
  } catch (error: any) {
    console.error("Error executing krs command:", error);
    return `Failed to krs recommend: ${error.message}`;
  }
};

export const krsNamespaces = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec("exec", [
      containerID,
      "krs", // Command to run inside the container
      "namespaces", // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log("Command executed, output received: ", output);

    if (output?.stderr) {
      console.error("Error output from krs namespaces:", output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || "No output received";
  } catch (error: any) {
    console.error("Error executing krs command:", error);
    return `Failed to krs namespaces: ${error.message}`;
  }
};

export const krsPods = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec("exec", [
      containerID,
      "krs", // Command to run inside the container
      "pods", // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log("Command executed, output received: ", output);

    if (output?.stderr) {
      console.error("Error output from krs pods:", output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || "No output received";
  } catch (error: any) {
    console.error("Error executing krs command:", error);
    return `Failed to krs pods: ${error.message}`;
  }
};

export const krsExit = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec("exec", [
      containerID,
      "krs", // Command to run inside the container
      "exit", // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log("Command executed, output received: ", output);

    if (output?.stderr) {
      console.error("Error output from krs recommend:", output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || "No output received";
  } catch (error: any) {
    console.error("Error executing krs command:", error);
    return `Failed to krs exit: ${error.message}`;
  }
};

export const krsHealth = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);
  } catch (error: any) {
    console.error("Error executing krs command:", error);
    return `Failed to krs health: ${error.message}`;
  }
};
