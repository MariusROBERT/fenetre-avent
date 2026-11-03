<script>
	import { invalidateAll } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import { siteConfig } from '#lib/config/site.js';
	/** @typedef {NonNullable<import('./$types').PageData['registrations']>[number]} Entry */
	let { data } = $props();
	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let notice = $state('');
	let busy = $state(false);
	/** @type {Entry | null} */ let editing = $state(null);
	/** @type {Entry | null} */ let draft = $state(null);
	const labels = {
		date: 'Date',
		name: 'Nom',
		email: 'E-mail',
		phone: 'Téléphone',
		description: 'Description',
		address: 'Adresse',
		latitude: 'Latitude',
		longitude: 'Longitude',
		status: 'Statut'
	};
	/** @type {(keyof typeof labels)[]} */ const fields = [
		'date',
		'name',
		'email',
		'phone',
		'description',
		'address',
		'latitude',
		'longitude',
		'status'
	];
	/** @param {string} date */ const formatDate = (date) =>
		new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(
			new Date(`${date}T12:00:00Z`)
		);
	const byDate = $derived(new Map((data.registrations ?? []).map((entry) => [entry.date, entry])));
	/** @param {SubmitEvent} event */ async function login(event) {
		event.preventDefault();
		busy = true;
		errorMessage = '';
		try {
			const response = await fetch('/api/auth/sign-in/email', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ email, password })
			});
			if (!response.ok) throw new Error();
			await invalidateAll();
		} catch {
			errorMessage = 'Identifiants invalides.';
		} finally {
			busy = false;
		}
	}
	async function logout() {
		await fetch('/api/auth/sign-out', { method: 'POST' });
		await invalidateAll();
	}
	/** @param {Entry} entry */ function edit(entry) {
		editing = entry;
		draft = { ...entry };
		errorMessage = '';
		notice = '';
	}
	async function save() {
		if (!draft) return;
		busy = true;
		errorMessage = '';
		try {
			const response = await fetch('/api/admin/registrations', {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					...draft,
					latitude: Number(draft.latitude),
					longitude: Number(draft.longitude)
				})
			});
			if (!response.ok)
				throw new Error((await response.json()).message ?? 'Modification impossible.');
			editing = null;
			notice = 'Modifications enregistrées.';
			await invalidateAll();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Modification impossible.';
		} finally {
			busy = false;
		}
	}
	/** @param {Entry} entry */ async function remove(entry) {
		if (!confirm(`Supprimer définitivement l'inscription de ${entry.name} ?`)) return;
		busy = true;
		errorMessage = '';
		notice = '';
		try {
			const response = await fetch('/api/admin/registrations', {
				method: 'DELETE',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ id: entry.id })
			});
			if (!response.ok) throw new Error('Suppression impossible.');
			notice = 'Inscription supprimée.';
			await invalidateAll();
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Suppression impossible.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head
	><title>Administration — Fenêtres de l'Avent</title><meta
		name="robots"
		content="noindex, nofollow"
	/></svelte:head
>

<main class="mx-auto min-h-screen max-w-6xl px-4 py-10 text-[#FFF4DB] sm:px-6 lg:px-8">
	{#if !data.authenticated}
		<section class="mx-auto mt-16 max-w-md rounded-xl bg-[#FFF9ED] p-7 text-[#153D33] shadow-xl">
			<h1 class="text-2xl font-bold">Administration</h1>
			<p class="mt-2 text-slate-600">Connectez-vous pour gérer le calendrier.</p>
			<form class="mt-6 space-y-4" onsubmit={login}>
				<label class="block text-sm font-medium"
					>E-mail<input
						class="mt-1 block min-h-11 w-full rounded border border-slate-300 bg-white px-3"
						type="email"
						bind:value={email}
						required
						autocomplete="username"
					/></label
				>
				<label class="block text-sm font-medium"
					>Mot de passe<input
						class="mt-1 block min-h-11 w-full rounded border border-slate-300 bg-white px-3"
						type="password"
						bind:value={password}
						required
						autocomplete="current-password"
					/></label
				>
				{#if errorMessage}<p class="text-sm text-red-700" role="alert">{errorMessage}</p>{/if}
				<Button class="min-h-11 w-full" type="submit" disabled={busy}
					>{busy ? 'Connexion…' : 'Se connecter'}</Button
				>
			</form>
		</section>
	{:else}
		<header class="mb-8 flex items-center justify-between gap-4">
			<div>
				<p class="font-medium text-[#D6B56E]">{siteConfig.municipality.name}</p>
				<h1 class="mt-1 text-3xl font-bold">Administration · Avent {data.year}</h1>
			</div>
			<Button variant="outline" class="min-h-11 text-[#153D33]" onclick={logout}>Déconnexion</Button
			>
		</header>
		{#if notice}<p class="mb-4 rounded bg-emerald-100 p-3 text-emerald-900" role="status">
				{notice}
			</p>{/if}
		{#if errorMessage}<p class="mb-4 rounded bg-red-100 p-3 text-red-900" role="alert">
				{errorMessage}
			</p>{/if}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each Array.from({ length: 24 }, (_, i) => `${data.year}-12-${String(i + 1).padStart(2, '0')}`) as date (date)}
				{@const entry = byDate.get(date)}
				<article
					class="rounded-xl border border-[#D6B56E]/50 bg-[#FFF9ED] p-4 text-[#153D33] shadow-md"
				>
					<h2 class="text-lg font-bold">{formatDate(date)}</h2>
					{#if entry}
						<dl class="mt-3 space-y-2 text-sm">
							{#each Object.entries(entry) as [key, value] (key)}<div>
									<dt class="font-semibold">{key}</dt>
									<dd class="break-words">{value ?? '—'}</dd>
								</div>{/each}
						</dl>
						<div class="mt-4 flex gap-2">
							<Button class="min-h-10" onclick={() => edit(entry)}>Modifier</Button><Button
								variant="outline"
								class="min-h-10 text-red-800"
								onclick={() => remove(entry)}>Supprimer</Button
							>
						</div>
					{:else}<p class="mt-3 text-sm text-slate-600">Aucune inscription</p>{/if}
				</article>
			{/each}
		</div>
	{/if}
</main>

{#if editing && draft}
	<div
		class="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
		role="presentation"
		onclick={(event) => {
			if (event.target === event.currentTarget) editing = null;
		}}
	>
		<div
			class="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-[#FFF9ED] p-6 text-[#153D33]"
			role="dialog"
			aria-modal="true"
			aria-labelledby="edit-title"
			tabindex="-1"
		>
			<h2 id="edit-title" class="text-xl font-bold">Modifier · {formatDate(editing.date)}</h2>
			<form
				class="mt-4 grid gap-3 sm:grid-cols-2"
				onsubmit={(event) => {
					event.preventDefault();
					save();
				}}
			>
				{#each fields as field (field)}
					<label
						class={`block text-sm font-medium ${field === 'description' || field === 'address' ? 'sm:col-span-2' : ''}`}
						>{labels[field]}
						{#if field === 'description'}<textarea
								class="mt-1 min-h-24 w-full rounded border border-slate-300 bg-white p-2"
								bind:value={draft[field]}
								required></textarea>
						{:else if field === 'status'}<select
								class="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-2"
								bind:value={draft[field]}
								><option value="pending">En attente</option><option value="confirmed"
									>Confirmée</option
								><option value="cancelled">Annulée</option></select
							>
						{:else}<input
								class="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-2"
								type={field === 'date'
									? 'date'
									: field === 'email'
										? 'email'
										: field === 'latitude' || field === 'longitude'
											? 'number'
											: 'text'}
								step={field === 'latitude' || field === 'longitude' ? 'any' : undefined}
								bind:value={draft[field]}
								required={['name', 'address', 'latitude', 'longitude'].includes(field)}
							/>{/if}
					</label>
				{/each}
				<div class="flex gap-2 sm:col-span-2">
					<Button type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Button
					><Button type="button" variant="outline" onclick={() => (editing = null)}>Annuler</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
