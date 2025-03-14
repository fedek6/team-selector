<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  interface Response {
    message: string;
    data?: Record<string, string>;
  }

  interface DataResponse {
    nickname: string;
    team: string;
  }

  const TEAM_LIMIT = 8;
  let team1: string[] = $state([]);
  let team2: string[] = $state([]);
  let team1Count: number = $derived(team1.length);
  let team2Count: number = $derived(team2.length);
  let selectedTeam: string | undefined = $state();
  let error: string | undefined = $state();
  let nickname = $state("");
  let msg = $state("");
  let formDisabled = $state(false);
  let intervalId: number;

  const { VITE_API_URL: API_URL } = import.meta.env;

  // Upload form
  const uploadResult = async (team: string, nickname: string) => {
    try {
      const res = await fetch(`${API_URL}/team/${team}/member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
        }),
      });

      const statusCode = res.status;
      const responseJson = (await res.json()) as Response;

      if (statusCode >= 200 && statusCode < 300) {
        msg = "You've been added to team!";
        console.log("Success:", responseJson);
        localStorage.setItem("registered", "true");
        formDisabled = true;
      } else {
        error = responseJson.message;
        console.error("Error:", responseJson);
      }
    } catch (error) {
      error = "Backend problem";
      console.error("Fetch error:", error);
    }
  };

  // get data
  const getData = async () => {
    try {
      const res = await fetch(`${API_URL}/members`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      msg = "refreshing...";

      const statusCode = res.status;
      const responseJson = (await res.json()) as DataResponse[];

      if (statusCode >= 200 && statusCode < 300) {
        const remoteTeam1: string[] = [];
        const remoteTeam2: string[] = [];

        responseJson.forEach((element) => {
          if (element.team === "orange") {
            remoteTeam1.push(element.nickname);
          } else {
            remoteTeam2.push(element.nickname);
          }
        });

        team1 = remoteTeam1;
        team2 = remoteTeam2;

        console.log(responseJson);
      } else {
        error = "Unable to get data";
        console.error("Error:", responseJson);
      }
    } catch (error) {
      error = "Backend problem";
      console.error("Fetch error:", error);
    } finally {
      msg = "";
    }
  };

  onMount(() => {
    getData();
    intervalId = setInterval(getData, 2500);
    if (localStorage.getItem("registered")) {
      formDisabled = true;
    }
  });

  onDestroy(() => {
    clearInterval(intervalId);
  });

  const checkIsNickTaken = (nick: string) =>
    team1
      .map((v) => v.toLocaleLowerCase())
      .some((v) => v === nick.trim().toLocaleLowerCase()) ||
    team2.some((v) => v === nick.trim().toLocaleLowerCase());

  function handleSubmit(
    event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }
  ) {
    console.log(import.meta.env.VITE_API_URL);

    event.preventDefault();
    error = undefined;

    if (nickname.trim() === "")
      return (error = "You must type a valid nickname!");

    if (checkIsNickTaken(nickname)) return (error = "Sorry nick is taken!");

    if (selectedTeam == "orange") {
      if (team1.length < TEAM_LIMIT) {
        team1.push(nickname.trim());
        uploadResult("orange", nickname.trim());
      } else {
        return (error = "Team orange is already full.");
      }
    } else if (selectedTeam == "green") {
      if (team2.length < TEAM_LIMIT) {
        team2.push(nickname.trim());
        uploadResult("green", nickname.trim());
      } else {
        return (error = "Team green is already full.");
      }
    } else {
      return (error = "You must select a team!");
    }
  }
</script>

<main
  class="w-full min-h-[100vh] flex justify-center p-4 bg-[url(/detqs3j-f16db3d6-7bb2-4ea7-9b9b-7b9674cc01f9.jpg)] bg-cover bg-center"
>
  <div class="cs-tabs max-w-[600px] w-full p-4 block">
    <div class="panel block p-5">
      <div class="mb-4">
        Urodzinowa strzelanka Fedosława<br />
        14-03-2025 20:00
      </div>

      <h1 class="text-xl">Please register and select a team:</h1>
      <hr class="cs-hr mb-6" />

      <section>
        {#if error}
          <h1
            class="text-2xl"
            bind:textContent={error}
            contenteditable="plaintext-only"
          ></h1>
        {/if}

        <form onsubmit={handleSubmit}>
          <label class="cs-input__label" for="input">Call sign:</label>
          <input
            class="cs-input"
            type="text"
            bind:value={nickname}
            placeholder="Enter your nickname"
          />

          <fieldset class="cs-fieldset my-4">
            <legend>Please select team</legend>
            <div class="radio-wrapper">
              <input
                type="radio"
                bind:group={selectedTeam}
                value={"orange"}
                id="orange"
              />
              <label for="orange">Orange</label>
            </div>
            <div class="radio-wrapper">
              <input
                type="radio"
                bind:group={selectedTeam}
                value={"green"}
                id="green"
              />
              <label for="green">Green</label>
            </div>
          </fieldset>

          <button type="submit" class="cs-btn" disabled={formDisabled}
            >Submit</button
          >
          <hr class="cs-hr mt-6" />
        </form>
      </section>

      {#if msg}
        <h1 bind:textContent={msg} contenteditable="plaintext-only"></h1>
      {:else}
        <h1>Data loaded!</h1>
      {/if}

      <div class="grid grid-cols-2 mt-4 text-center gap-4">
        <section class="center">
          <div
            class="w-[64px] h-[64px] border-4 border-orange-700 rounded-full inline-block overflow-hidden object-contain"
          >
            <img
              src="/Screenshot from 2025-03-14 15-16-01.png"
              alt="Pysiroelli"
              class="h-[100%]"
            />
          </div>
          <h2 class="text-lg leading-[120%]">Orange<br />cpt. Pysiorelli</h2>
          <p class="mb-2">{team1Count}/{TEAM_LIMIT}</p>
          <hr class="cs-hr mb-3" />
          <ul>
            {#each team1 as member}
              <li>{member}</li>
            {/each}
          </ul>
        </section>

        <section class="center">
          <div
            class="w-[64px] h-[64px] border-4 border-green-700 rounded-full inline-block overflow-hidden object-contain"
          >
            <img
              src="/Screenshot from 2025-03-14 15-14-49.png"
              alt="Fedek"
              class="h-[100%]"
            />
          </div>
          <h2 class="text-lg leading-[120%]">Green<br />cpt. Fedek</h2>
          <p class="mb-2">{team2Count}/{TEAM_LIMIT}</p>
          <hr class="cs-hr mb-3" />
          <ul>
            {#each team2 as member}
              <li>{member}</li>
            {/each}
          </ul>
        </section>
      </div>
    </div>
  </div>
</main>
