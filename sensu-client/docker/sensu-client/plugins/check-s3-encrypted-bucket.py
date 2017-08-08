#!/usr/bin/python

from sensu_plugin import SensuPluginCheck
import boto3
import botocore
import datetime
import StringIO


class S3EncryptedBucketCheck(SensuPluginCheck):

    ENCRYPTED_KEY = 'sensu-encrypted-upload'
    UNENCRYPTED_KEY = 'sensu-unencrypted-upload'

    def setup(self):
        self.parser.add_argument(
          '-b',
          '--bucket',
          required=True,
          type=str,
          help='The name of the s3 bucket to check'
        )

    def run(self):
        # Initialise S3 objects.
        s3 = boto3.resource('s3')
        bucket = s3.Bucket(self.options.bucket)
        encrypted_obj = bucket.Object(self.ENCRYPTED_KEY)
        unencrypted_obj = bucket.Object(self.UNENCRYPTED_KEY)

        # Create data in a file like object.
        now = datetime.datetime.now()
        stringdata = StringIO.StringIO()
        stringdata.write = "S3EncryptedBucketCheck marker created at {}"\
            .format(now)

        # Try to upload as encypted file.
        try:
            encrypted_obj.put(
                Body=stringdata,
                ServerSideEncryption='AES256',
            )
        except botocore.exceptions.ClientError:
            self.critical("Can not upload encrypted file.")

        # Try to upload as unencypted file.
        # We expect this to fail.
        try:
            unencrypted_obj.put(
                Body=stringdata,
            )
        except botocore.exceptions.ClientError:
            uploaded_unencrypted_file = False

        if uploaded_unencrypted_file:
            self.critical("Critical: Uploaded an unencrpted file.")

        stringdata.close()
        self.ok()


if __name__ == "__main__":
    S3EncryptedBucketCheck()
