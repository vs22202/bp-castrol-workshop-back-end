CREATE DATABASE bp_capstone_project;
GO
USE bp_capstone_project;
GO
CREATE TABLE [dbo].[Applications](
	[application_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL,
	[workshop_name] [nvarchar](255) NOT NULL,
	[workshop_post_code] [nvarchar](20) NOT NULL,
	[address] [nvarchar](255) NOT NULL,
	[state] [nvarchar](50) NOT NULL,
	[city] [nvarchar](100) NOT NULL,
	[user_name] [nvarchar](100) NOT NULL,
	[user_mobile] [bigint] NOT NULL,
	[bay_count] [int] NOT NULL,
	[services_offered] [nvarchar](max) NOT NULL,
	[expertise] [nvarchar](max) NOT NULL,
	[brands] [nvarchar](max) NOT NULL,
	[consent_process_data] [bit] NOT NULL,
	[consent_being_contacted] [bit] NOT NULL,
	[consent_receive_info] [bit] NOT NULL,
	[file_paths] [nvarchar](max) NULL,
	[application_status] [nvarchar](50) NOT NULL,
	[last_modified_date] [datetime2](7) NOT NULL
)
GO
CREATE TABLE [dbo].[Otp_Verification](
	[generate_time] [datetime] NOT NULL,
	[otp] [nvarchar](50) NOT NULL,
	[user_email] [nvarchar](50),
	[user_mobile] [bigint]
)
GO
CREATE TABLE [dbo].[Users](
	[user_id] [int] IDENTITY(1,1) NOT NULL,
	[user_email] [nvarchar](50),
	[user_mobile] [bigint],
	[password] [nvarchar](90) NOT NULL,
	[verified] [bit] NOT NULL
)
GO