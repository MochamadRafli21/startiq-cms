CREATE TABLE `links` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`descriptions` varchar(500),
	`banner` varchar(500),
	`tags` json NOT NULL DEFAULT ('[]'),
	`attributes` json NOT NULL DEFAULT ('{}'),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `links_id` PRIMARY KEY(`id`)
);
