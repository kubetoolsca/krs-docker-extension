import { v1 } from '@docker/extension-api-client-types';
// Declare a variable to store the container ID
let containerID: string;
let kubeConfigPath: string;
let currentContext: any;
/**
 * Check the Kubernetes context
 * @returns the current Kubernetes context
 */
const checkKubeContext = async (ddClient: v1.DockerDesktopClient) => {
  try {
    const output = await ddClient.extension.host?.cli.exec('kubectl', [
      'config',
      'current-context',
    ]);

    const context = output?.stdout.trim();
    console.log('Current Kubernetes context: ', context);
    return context;
  } catch (error: any) {
    console.error('Error checking Kubernetes context: ', error);
    return '';
  }
};

const checkMinikubeIp = async (ddClient: v1.DockerDesktopClient) => {
  try {
    const output = await ddClient.extension.host?.cli.exec('kubectl', [
      'get',
      'node',
      'minikube',
      '-o',
      `jsonpath='{.status.addresses[?(@.type=="InternalIP")].address}'`,
    ]);
    const ip = output?.stdout.trim();
    console.log('Current Minikube IP: ', ip);
    return ip;
  } catch (error: any) {
    console.error('Error checking Minikube IP: ', error);
    return '';
  }
};

export const startKrsContainer = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Check the current Kubernetes context before starting the container
    currentContext = await checkKubeContext(ddClient);
    console.log(currentContext);
    if (!containerID) {
      let output: any;

      if (currentContext == 'minikube') {
        // Start the container in detached mode
        output = await ddClient.docker.cli.exec('run', [
          '-d', // Detached mode to keep the container running
          '--network',
          'host', // Add the --network host option
          '-v', // Volume flag
          `${kubeConfigPath}:/root/.kube/config`, // Mount the local ~/.kube/config to the container's /root/.kube/config
          '-v',
          `~/.minikube:/root/.minikube`,
          'kubetoolsca/krs-docker-extension:0.0.1', // Docker image to run
          'sleep',
          'infinity',
        ]);
      } else {
        // Start the container in detached mode
        output = await ddClient.docker.cli.exec('run', [
          '-d', // Detached mode to keep the container running
          '--network',
          'host', // Add the --network host option
          '-v', // Volume flag
          `${kubeConfigPath}:/root/.kube/config`, // Mount the local ~/.kube/config to the container's /root/.kube/config
          'kubetoolsca/krs-docker-extension:0.0.1', // Docker image to run
          'sleep',
          'infinity',
        ]);
      }
      containerID = output.stdout.trim();
      console.log('Container started with ID: ', containerID);

      // Execute the shell script inside the container
      if (currentContext == 'minikube') {
        const minikubeIp = await checkMinikubeIp(ddClient);
        console.log(minikubeIp);
        const execScriptOutput = await ddClient.docker.cli.exec('exec', [
          containerID,
          'sh',
          `/root/fix-kubeconfig.sh ${minikubeIp}`,
        ]);

        if (execScriptOutput.stderr) {
          console.error(
            'Error executing the script: ',
            execScriptOutput.stderr,
          );
        } else {
          console.log(
            'Script executed successfully: ',
            execScriptOutput.stdout,
          );
        }
      }
    }
    return containerID;
  } catch (error: any) {
    console.error('Error starting KRS container: ', error);
    return `Failed to start KRS container: ${error.message}`;
  }
};

export const initKRS = async (
  ddClient: v1.DockerDesktopClient,
  kubePath: string,
) => {
  try {
    let output: any;

    // Get the Kubernetes Configuration Path
    kubeConfigPath = kubePath;

    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    output = await ddClient.docker.cli.exec('exec', [
      containerID,
      'krs', // Command to run inside the container
      'init', // Arguments to the krs command
      `${
        currentContext == 'minikube'
          ? '--kubeconfig /root/.kube/config_copy'
          : ''
      }`,
    ]);

    // Log the output to see the results
    console.log('Command executed, output received: ', output);

    if (output?.stderr) {
      console.error('Error output from krs init:', output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || 'No output received';
  } catch (error: any) {
    console.error('Error executing krs command:', error);
    return `Failed to initialize krs: ${error.stderr}`;
  }
};

export const krsScan = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec('exec', [
      containerID,
      'krs', // Command to run inside the container
      'scan', // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log('Command executed, output received: ', output);

    if (output?.stderr) {
      console.error('Error output from krs scan:', output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || 'No output received';
  } catch (error: any) {
    console.error('Error executing krs command:', error);
    return `Failed to krs scan: ${error.stderr}`;
  }
};

export const krsRecommend = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec('exec', [
      containerID,
      'krs', // Command to run inside the container
      'recommend', // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log('Command executed, output received: ', output);

    if (output?.stderr) {
      console.error('Error output from krs recommend:', output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || 'No output received';
  } catch (error: any) {
    console.error('Error executing krs command:', error);
    return `Failed to krs recommend: ${error.stderr}`;
  }
};

export const krsNamespaces = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec('exec', [
      containerID,
      'krs', // Command to run inside the container
      'namespaces', // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log('Command executed, output received: ', output);

    if (output?.stderr) {
      console.error('Error output from krs namespaces:', output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || 'No output received';
  } catch (error: any) {
    console.error('Error executing krs command:', error);
    return `Failed to krs namespaces: ${error.stderr}`;
  }
};

export const krsPods = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec('exec', [
      containerID,
      'krs', // Command to run inside the container
      'pods', // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log('Command executed, output received: ', output);

    if (output?.stderr) {
      console.error('Error output from krs pods:', output.stderr);
      return `Error: ${output.stderr}`;
    }

    return output?.stdout || 'No output received';
  } catch (error: any) {
    console.error('Error executing krs command:', error);
    return `Failed to krs pods: ${error.stderr}`;
  }
};

export const krsExport = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec('exec', [
      containerID,
      'krs',
      'export',
    ]);

    // Log the output to see the results
    console.log('Command executed, output received: ', output);

    if (output?.stderr) {
      console.error('Error output from krs export:', output.stderr);
      return `Error: ${output.stderr}`;
    } else {
      // Copy the pod info json file from the running container to the host machine
      try {
        await ddClient.docker.cli.exec('cp', [
          `${containerID}:/exported_pod_info.json ~/`,
        ]);
      } catch (error: any) {
        return error;
      }
    }

    return output.stdout
      ? 'Pod info with logs and events exported. Json file saved to your home directory!'
      : 'No output received';
  } catch (error: any) {
    console.error('Error executing krs command:', error);
    return `Failed to krs export: ${error.stderr}`;
  }
};

export const krsExit = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);

    // Run the Docker command using the Docker Desktop API
    const output = await ddClient.docker.cli.exec('exec', [
      containerID,
      'krs', // Command to run inside the container
      'exit', // Arguments to the krs command
    ]);

    // Log the output to see the results
    console.log('Command executed, output received: ', output);

    if (output?.stderr) {
      console.error('Error output from krs exit:', output.stderr);
      return `Error: ${output.stderr}`;
    }

    // Stop the running container.
    try {
      await ddClient.docker.cli.exec('stop', [containerID]);
      containerID = '';
    } catch (error: any) {
      return `Failed to stop the running container: ${error.message}`;
    }

    return output?.stdout || 'No output received';
  } catch (error: any) {
    console.error('Error executing krs command:', error);
    return `Failed to krs exit: ${error.message}`;
  }
};

export const krsHealth = async (ddClient: v1.DockerDesktopClient) => {
  try {
    // Ensure the container is running
    await startKrsContainer(ddClient);
  } catch (error: any) {
    console.error('Error executing krs command:', error);
    return `Failed to krs health: ${error.message}`;
  }
};
