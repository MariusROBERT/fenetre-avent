<script>
	import { resolve } from '$app/paths';
	import { tick } from 'svelte';
	import LocationPicker from '#lib/components/LocationPicker.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { siteConfig } from '#lib/config/site.js';
	import { registrationInputFromFormData, registrationSchema } from '#lib/schemas/registration.js';

	/** @type {{data: import('./$types').PageData, form: import('./$types').ActionData}} */
	let { data, form } = $props();
	/** @type {string[]} */
	let clientErrors = $state([]);
	/** @type {Record<string, string[] | undefined>} */
	let liveFieldErrors = $state({});
	/** @type {Record<string, boolean>} */
	let touchedFields = $state({});
	let submitAttempted = $state(false);
	/** @type {HTMLFormElement | null} */
	let formElement = $state(null);
	let address = $state('');
	let latitude = $state(siteConfig.municipality.mapCenter[1]);
	let longitude = $state(siteConfig.municipality.mapCenter[0]);
	const fieldNames = [
		'name',
		'email',
		'phone',
		'description',
		'address',
		'latitude',
		'longitude',
		'rulesAccepted'
	];

	let fieldErrors = $derived.by(() => {
		/** @type {Record<string, string[] | undefined>} */
		const errors = { ...(form?.fieldErrors ?? {}) };
		for (const [field, touched] of Object.entries(touchedFields)) {
			if (!touched) continue;
			if (liveFieldErrors[field]?.length) errors[field] = liveFieldErrors[field];
			else delete errors[field];
		}
		return errors;
	});

	/** @param {string} field */
	function getFieldError(field) {
		return fieldErrors[field]?.[0] ?? '';
	}

	/** @param {ReturnType<typeof registrationInputFromFormData>} input */
	function updateValidation(input) {
		const result = registrationSchema.safeParse(input);
		liveFieldErrors = result.success ? {} : result.error.flatten().fieldErrors;
		if (submitAttempted)
			clientErrors = result.success ? [] : result.error.issues.map((issue) => issue.message);
	}

	/** @param {Event} event */
	function validateField(event) {
		const field = /** @type {HTMLInputElement | HTMLTextAreaElement} */ (event.target).name;
		if (!fieldNames.includes(field)) return;

		touchedFields = {
			...touchedFields,
			[field]: true,
			...(field === 'email' || field === 'phone' ? { email: true, phone: true } : {})
		};
		const formElement = /** @type {HTMLFormElement} */ (event.currentTarget);
		updateValidation(registrationInputFromFormData(new FormData(formElement)));
	}

	/** @param {boolean} checked */
	function validateRulesAcceptance(checked) {
		touchedFields = { ...touchedFields, rulesAccepted: true };
		if (!formElement) return;
		const input = registrationInputFromFormData(new FormData(formElement));
		input.rulesAccepted = checked;
		updateValidation(input);
	}

	/** @param {SubmitEvent & {currentTarget: HTMLFormElement}} event */
	function validateForm(event) {
		const formElement = event.currentTarget;
		submitAttempted = true;
		touchedFields = Object.fromEntries(fieldNames.map((field) => [field, true]));
		const result = registrationSchema.safeParse(
			registrationInputFromFormData(new FormData(formElement))
		);
		if (!result.success) {
			event.preventDefault();
			liveFieldErrors = result.error.flatten().fieldErrors;
			clientErrors = result.error.issues.map((issue) => issue.message);
			void tick().then(() => {
				const firstInvalidField = formElement.querySelector('[aria-invalid="true"]');
				if (firstInvalidField instanceof HTMLElement) firstInvalidField.focus();
			});
			return;
		}
		liveFieldErrors = {};
		clientErrors = [];
	}
</script>

<svelte:head>
	<title>Inscription — {siteConfig.name}</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10 text-[#FFF4DB] sm:px-6">
	<a
		class="text-sm text-[#D6B56E] underline underline-offset-4 hover:text-[#FFF4DB]"
		href={resolve('/')}>Retour au calendrier</a
	>
	<h1 class="mt-6 text-3xl font-bold">Inscription pour le {data.date}</h1>

	{#if form?.success && form.confirmation}
		<section
			class="mt-6 rounded-xl border border-[#91B99D] bg-[#DAE8D8] p-5 text-[#153D33]"
			aria-live="polite"
		>
			<h2 class="text-xl font-semibold">Votre fenêtre est inscrite</h2>
			<p class="mt-2">La date du {form.confirmation.date} est réservée.</p>
			<dl class="mt-4 space-y-2">
				<div>
					<dt class="font-semibold">Nom</dt>
					<dd>{form.confirmation.name}</dd>
				</div>
				<div>
					<dt class="font-semibold">Description</dt>
					<dd>{form.confirmation.description}</dd>
				</div>
				<div>
					<dt class="font-semibold">Adresse</dt>
					<dd>{form.confirmation.address}</dd>
				</div>
			</dl>
		</section>
	{:else if !data.available}
		<p class="mt-6 rounded-lg bg-[#DAE8D8] p-4 text-[#153D33]" role="status">
			{data.unavailableMessage}
		</p>
	{:else}
		<p class="mt-3 text-[#DAE8D8]">
			Les informations publiques ci-dessous seront affichées dans le calendrier. Vos coordonnées de
			contact resteront privées.
		</p>

		{#if form?.message}
			<div
				class="mt-5 rounded-lg border border-[#D6B56E] bg-[#FFF1CC] p-4 text-[#153D33]"
				role="alert"
			>
				<p>{form.message}</p>
				{#if form.errors.length}
					<ul class="mt-2 list-disc pl-5">
						{#each form.errors as message, index (`${message}-${index}`)}
							<li>{message}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
		{#if clientErrors.length}
			<div
				class="mt-5 rounded-lg border border-[#D6B56E] bg-[#FFF1CC] p-4 text-[#153D33]"
				role="alert"
			>
				<p>Vérifiez les champs du formulaire.</p>
				<ul class="mt-2 list-disc pl-5">
					{#each clientErrors as message, index (`${message}-${index}`)}
						<li>{message}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<form
			method="POST"
			class="mt-6 space-y-5"
			novalidate
			bind:this={formElement}
			oninput={validateField}
			onfocusout={validateField}
			onsubmit={validateForm}
		>
			<div>
				<Label class="mb-1 block font-medium" for="name">
					Nom du participant ou de la structure
				</Label>
				<Input
					class="h-12 w-full rounded-lg border-[#DAE8D8]/70 p-3"
					id="name"
					name="name"
					type="text"
					aria-invalid={Boolean(getFieldError('name'))}
					aria-describedby={getFieldError('name') ? 'name-error' : undefined}
					required
					minlength={2}
					maxlength={100}
				/>
				{#if getFieldError('name')}
					<p class="mt-1 text-sm text-[#F3ADB3]" id="name-error" aria-live="polite">
						{getFieldError('name')}
					</p>
				{/if}
			</div>

			<div>
				<Label class="mb-1 block font-medium" for="email">E-mail (facultatif)</Label>
				<Input
					class="h-12 w-full rounded-lg border-[#DAE8D8]/70 p-3"
					id="email"
					name="email"
					aria-invalid={Boolean(getFieldError('email'))}
					aria-describedby={getFieldError('email') ? 'email-error' : undefined}
					type="email"
					autocomplete="email"
				/>
				{#if getFieldError('email')}
					<p class="mt-1 text-sm text-[#F3ADB3]" id="email-error" aria-live="polite">
						{getFieldError('email')}
					</p>
				{/if}
			</div>

			<div>
				<Label class="mb-1 block font-medium" for="phone">Téléphone (facultatif)</Label>
				<Input
					class="h-12 w-full rounded-lg border-[#DAE8D8]/70 p-3"
					id="phone"
					name="phone"
					aria-invalid={Boolean(getFieldError('phone'))}
					aria-describedby={getFieldError('phone') ? 'phone-error' : undefined}
					type="tel"
					autocomplete="tel"
				/>
				<p class="mt-1 text-sm text-[#DAE8D8]">Indiquez au moins un moyen de contact.</p>
				{#if getFieldError('phone')}
					<p class="mt-1 text-sm text-[#F3ADB3]" id="phone-error" aria-live="polite">
						{getFieldError('phone')}
					</p>
				{/if}
			</div>

			<div>
				<Label class="mb-1 block font-medium" for="description">Description de la fenêtre</Label>
				<Textarea
					class="min-h-28 w-full rounded-lg border-[#DAE8D8]/70 p-3"
					id="description"
					name="description"
					aria-invalid={Boolean(getFieldError('description'))}
					aria-describedby={getFieldError('description') ? 'description-error' : undefined}
					required
					minlength="5"
					maxlength="1000"
				/>
				{#if getFieldError('description')}
					<p class="mt-1 text-sm text-[#F3ADB3]" id="description-error" aria-live="polite">
						{getFieldError('description')}
					</p>
				{/if}
			</div>

			<LocationPicker bind:address bind:latitude bind:longitude errors={fieldErrors} />

			<div class="flex items-start gap-3">
				<Checkbox
					class="mt-1"
					id="rulesAccepted"
					name="rulesAccepted"
					value="on"
					aria-invalid={Boolean(getFieldError('rulesAccepted'))}
					aria-describedby={getFieldError('rulesAccepted') ? 'rulesAccepted-error' : undefined}
					onCheckedChange={validateRulesAcceptance}
					required
				/>
				<Label class="leading-6" for="rulesAccepted">
					J’ai lu et j’accepte le
					<a class="underline underline-offset-4" href={resolve('/rules')}>règlement</a>. Je
					comprends que les informations publiques seront publiées.
				</Label>
			</div>
			{#if getFieldError('rulesAccepted')}
				<p class="text-sm text-[#F3ADB3]" id="rulesAccepted-error" aria-live="polite">
					{getFieldError('rulesAccepted')}
				</p>
			{/if}

			<Button class="h-12 rounded-lg px-5 font-semibold" type="submit">
				Confirmer l’inscription
			</Button>
		</form>
	{/if}
</main>
