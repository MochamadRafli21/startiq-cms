CREATE TABLE `domains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`domain` varchar(255) NOT NULL,
	`page_id` int,
	`is_primary` boolean DEFAULT false,
	`verified` boolean DEFAULT false,
	`verification_code` varchar(64),
	CONSTRAINT `domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `domains_domain_unique` UNIQUE(`domain`)
);
